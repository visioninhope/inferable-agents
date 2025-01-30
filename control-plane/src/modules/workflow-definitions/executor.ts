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
    await runWorkflow({
      workflowExecutionId: message.data.workflowExecutionId,
      clusterId: message.data.clusterId,
    });
  },
  {
    autorun: false,
    connection: ioredis,
  }
);

export async function onWorkflowExecutionRunStatusChange(target: string, status: string) {
  if (status === "done") {
    const [, clusterId, workflowExecutionId] = target
      .split("workflowExecution://clusters/")[1]
      .split("/executions/");

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
  const definition = await getWorkflowDefinition({ id, clusterId });

  await db.insert(workflowExecution).values({
    id: ulid(),
    cluster_id: clusterId,
    workflow_definition_id: id,
    workflow_definition_version: definition.version,
    workflow_definition_json: definition.json,
    input,
  });

  await queue.add(
    "executeWorkflow",
    {
      workflowExecutionId: id,
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
    throw new Error("Workflow execution not found");
  }

  const parsedDefinition = WorkflowDefinitionSchema.parse(execution.workflow_definition_json);

  const steps = parsedDefinition.workflow.steps;

  await Promise.all(
    steps.map(step => {
      if (step.if) {
        throw new Error("If statements are not supported yet");
      }

      if (step.for_each) {
        throw new Error("For each statements are not supported yet");
      }

      return runStep({ step, definition: parsedDefinition, clusterId, workflowExecutionId });
    })
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
}): Promise<void> => {
  const stepDefinition = definition.workflow.steps.find(s => s.id === step.id);

  if (!stepDefinition) {
    throw new Error(`Step ${step.id} not found in workflow`);
  }

  const currentStep = StepSchema.parse(stepDefinition);

  const dependsOn = currentStep.depends_on?.map(id =>
    definition.workflow.steps.find(s => s.id === id)
  );

  const dependents = await Promise.all(
    dependsOn?.map(async step => {
      if (!step) {
        throw new Error(`Step not found in workflow. Possibly inconsistent workflow definition.`);
      }

      const run = await createRunWithMessage({
        id: runIdForStep({ stepId: step.id, workflowExecutionId }),
        clusterId,
        name: step.id,
        systemPrompt: step.agent.systemPrompt,
        resultSchema: step.agent.resultSchema,
        attachedFunctions: step.agent.attachedFunctions?.map(f =>
          [f.service, f.function].join("_")
        ),
        tags: step.agent.tags,
        context: step.agent.context,
        message: "What's 1 + 1?",
        type: "human",
      });

      return run;
    }) ?? []
  );

  const allDependentsCompleted = dependents.every(run => run.status === "done");

  if (!allDependentsCompleted) {
    logger.info(`Waiting for dependents to complete for step ${currentStep.id}`);
  } else {
    await createRunWithMessage({
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

export const start = () => worker.run();
