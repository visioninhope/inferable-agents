import { ulid } from "ulid";
import { getWorkflowDefinition } from ".";

import { workflowExecution } from "../data";

import { Queue, Worker } from "bullmq";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../data";
import { logger } from "../observability/logger";
import { ioredis } from "../queues/core";
import { createRunWithMessage } from "../runs";
import { StepSchema, WorkflowDefinitionSchema } from "./schema";

export const workflowExecutionTarget = ({
  workflowExecutionId,
  clusterId,
}: {
  workflowExecutionId: string;
  clusterId: string;
}) => `workflowExecution://clusters/${clusterId}/executions/${workflowExecutionId}`;

export const isWorkflowExecutionTarget = (target: string) =>
  target.startsWith("workflowExecution://");

const queue = new Queue<{ workflowExecutionId: string; clusterId: string }>("executeWorkflow");

const worker = new Worker<{ workflowExecutionId: string; clusterId: string }>(
  "executeWorkflow",
  async message => {
    const parsed = z
      .object({
        workflowExecutionId: z.string(),
        clusterId: z.string(),
      })
      .parse(message.data);

    await runWorkflow({
      workflowExecutionId: parsed.workflowExecutionId,
      clusterId: parsed.clusterId,
    });
  },
  {
    autorun: false,
    connection: ioredis,
  }
);

export async function onWorkflowExecutionRunStatusChange(target: string, status: string) {
  logger.info("Workflow execution status changed", { target, status });

  if (status === "done") {
    const [clusterId, workflowExecutionId] = target
      .split("workflowExecution://clusters/")[1]
      .split("/executions/");

    logger.info("Adding workflow execution to queue", { workflowExecutionId, clusterId });
    await queue.add("executeWorkflow", {
      workflowExecutionId,
      clusterId,
    });
  }
}

export const executeDefinition = async ({
  id,
  clusterId,
  input,
}: {
  id: string;
  clusterId: string;
  input: Record<string, unknown>;
}) => {
  logger.info("Executing workflow definition", { id, clusterId });
  const definition = await getWorkflowDefinition({ id, clusterId });

  const workflowExecutionId = ulid();

  logger.info("Creating workflow execution record", {
    id,
    clusterId,
    version: definition.version,
    workflowExecutionId,
  });

  await db.insert(workflowExecution).values({
    id: workflowExecutionId,
    cluster_id: clusterId,
    workflow_definition_id: id,
    workflow_definition_version: definition.version,
    workflow_definition_json: definition.json,
    input,
  });

  logger.info("Adding initial workflow execution to queue", { id, clusterId });

  await queue.add(
    "executeWorkflow",
    {
      workflowExecutionId,
      clusterId,
    },
    {
      jobId: `initial-${id}`,
    }
  );
};

export const runWorkflow = async ({
  workflowExecutionId,
  clusterId,
}: {
  workflowExecutionId: string;
  clusterId: string;
}): Promise<void> => {
  logger.info("Starting workflow execution", { workflowExecutionId, clusterId });

  const [execution] = await db
    .select()
    .from(workflowExecution)
    .where(
      and(
        eq(workflowExecution.id, workflowExecutionId),
        eq(workflowExecution.cluster_id, clusterId)
      )
    );

  if (!execution) {
    logger.info("Workflow execution not found", { workflowExecutionId, clusterId });
    throw new Error("Workflow execution not found");
  }

  const parsedDefinition = WorkflowDefinitionSchema.parse(execution.workflow_definition_json);
  const steps = parsedDefinition.workflow.steps;

  logger.info("Executing workflow steps", {
    workflowExecutionId,
    clusterId,
    stepCount: steps.length,
    stepIds: steps.map(s => s.id),
  });

  await Promise.all(
    steps.map(step =>
      runStep({ step, definition: parsedDefinition, clusterId, workflowExecutionId })
    )
  );
};

const runStep = async ({
  step,
  definition,
  clusterId,
  workflowExecutionId,
}: {
  step: z.infer<typeof StepSchema>;
  definition: z.infer<typeof WorkflowDefinitionSchema>;
  clusterId: string;
  workflowExecutionId: string;
}): Promise<
  | {
      id: string;
      status: string;
    }
  | undefined
> => {
  logger.info("Running workflow step", { stepId: step.id, workflowExecutionId, clusterId });

  const stepDefinition = definition.workflow.steps.find(s => s.id === step.id);

  if (!stepDefinition) {
    logger.info("Step not found in workflow", { stepId: step.id });
    throw new Error(`Step ${step.id} not found in workflow`);
  }

  const currentStep = StepSchema.parse(stepDefinition);

  const dependsOn = currentStep.depends_on?.map(id =>
    definition.workflow.steps.find(s => s.id === id)
  );

  logger.info("Processing step dependencies", {
    stepId: step.id,
    dependencyCount: dependsOn?.length ?? 0,
    dependencies: dependsOn?.map(s => s?.id),
  });

  const dependents = await Promise.all(
    dependsOn?.map(async step => {
      if (!step) {
        logger.info("Dependent step not found", { stepId: step?.id });
        throw new Error(`Step not found in workflow. Possibly inconsistent workflow definition.`);
      }

      logger.info("Creating run for dependent step", {
        stepId: step.id,
        runId: runIdForStep({ stepId: step.id, workflowExecutionId }),
      });

      return runStep({ step, definition, clusterId, workflowExecutionId });
    }) ?? []
  );

  const allDependentsCompleted = dependents.every(run => run?.status === "done");

  if (allDependentsCompleted) {
    logger.info("All dependencies completed, creating run for step", {
      stepId: currentStep.id,
      runId: runIdForStep({ stepId: step.id, workflowExecutionId: workflowExecutionId }),
    });

    return createRunWithMessage({
      id: runIdForStep({ stepId: step.id, workflowExecutionId: workflowExecutionId }),
      clusterId,
      name: step.id,
      systemPrompt: step.agent.systemPrompt,
      resultSchema: step.agent.resultSchema,
      attachedFunctions: step.agent.attachedFunctions?.map(f => [f.service, f.function].join("_")),
      tags: step.agent.tags,
      context: step.agent.context,
      message: "What's 1 + 1?",
      type: "human",
      onStatusChangeHandler: workflowExecutionTarget({
        workflowExecutionId,
        clusterId,
      }),
    });
  }
};

function runIdForStep({
  stepId,
  workflowExecutionId,
}: {
  stepId: string;
  workflowExecutionId: string;
}) {
  return `wf-run-${workflowExecutionId}-${stepId}`;
}

export const start = () => {
  worker.run();
};

export const stop = () => {
  worker.close();
};
