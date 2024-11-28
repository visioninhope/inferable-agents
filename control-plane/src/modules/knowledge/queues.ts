import { env } from "../../utilities/env";

import { Consumer } from "sqs-consumer";
import { BaseMessage, baseMessageSchema, sqs, withObservability } from "../sqs";
import { getLearnings, mergeLearnings, upsertLearning } from "./learnings";
import { z } from "zod";
import { learningSchema } from "../contract";
import { logger } from "../observability/logger";
import { ulid } from "ulid";

const learningProcessConsumer = env.SQS_LEARNING_INGEST_QUEUE_URL
  ? Consumer.create({
      queueUrl: env.SQS_LEARNING_INGEST_QUEUE_URL,
      batchSize: 5,
      visibilityTimeout: 60,
      heartbeatInterval: 30,
      handleMessage: withObservability(
        env.SQS_LEARNING_INGEST_QUEUE_URL,
        handleLearningIngest,
      ),
      sqs,
    })
  : undefined;

export const start = async () => {
  await Promise.all([learningProcessConsumer?.start()]);
};

export const stop = async () => {
  learningProcessConsumer?.stop();
};

async function handleLearningIngest(message: BaseMessage) {
  const zodResult = baseMessageSchema
    .extend({
      learnings: z.array(learningSchema),
    })
    .safeParse(message);

  if (!zodResult.success) {
    logger.error("Message does not conform to learning ingestion schema", {
      error: zodResult.error,
      body: message,
    });
    return;
  }

  const { clusterId, runId, learnings } = zodResult.data;

  logger.info("Evaluating new learnings", {
    learnings,
  });

  const existing = await getLearnings(clusterId);

  const merged = await mergeLearnings({
    clusterId,
    newLearnings: learnings.map((l) => ({
      ...l,
      id: ulid(),
    })),
    existingLearnings: existing,
  });

  const newLearnings = merged.filter(
    (l) => !existing.find((e) => e.id === l.id),
  );
  if (!newLearnings.length) {
    return;
  }

  logger.info("New learnings found", {
    learnings: newLearnings,
  });

  for (const learning of newLearnings) {
    await upsertLearning(clusterId, learning);
  }
}
