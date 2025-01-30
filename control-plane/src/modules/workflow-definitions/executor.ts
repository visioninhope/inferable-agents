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
  executionId,
  clusterId,
}: {
  executionId: string;
  clusterId: string;
}) => `workflowExecution://clusters/${clusterId}/executions/${executionId}`;

export const isWorkflowExecutionTarget = (target: string) =>
  target.startsWith("workflowExecution://");

const queue = new Queue<{ executionId: string; clusterId: string }>("executeWorkflow");

const worker = new Worker<{ executionId: string; clusterId: string }>(
  "executeWorkflow",
  async message => {
    await runWorkflow({ executionId: message.data.executionId, clusterId: message.data.clusterId });
  },
  {
    autorun: false,
    connection: ioredis,
  }
);

export async function onWorkflowExecutionRunStatusChange(target: string, status: string) {
  if (status === "done") {
    const [, clusterId, executionId] = target
      .split("workflowExecution://clusters/")[1]
      .split("/executions/");

    await queue.add("executeWorkflow", {
      executionId,
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
      executionId: id,
      clusterId,
    },
    {
      jobId: `initial-${id}`,
    }
  );
};

export const runWorkflow = async ({
  executionId,
  clusterId,
}: {
  executionId: string;
  clusterId: string;
}): Promise<void> => {
  const [execution] = await db
    .select()
    .from(workflowExecution)
    .where(and(eq(workflowExecution.id, executionId), eq(workflowExecution.cluster_id, clusterId)));

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

      return runStep({ step, definition: parsedDefinition, clusterId });
    })
  );
};

const runStep = async ({
  step,
  definition,
  clusterId,
}: {
  step: z.infer<typeof StepSchema>;
  definition: z.infer<typeof WorkflowDefinitionSchema>;
  clusterId: string;
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
        id: runIdForStep(step),
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
      id: runIdForStep(step),
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

function runIdForStep(step: z.infer<typeof StepSchema>) {
  return `run-${step.type}-${step.id}`;
}

export const start = () => worker.run();
