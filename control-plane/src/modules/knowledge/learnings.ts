import { logger } from "../observability/logger";
import { db, knowledgeEntities, knowledgeLearnings } from "../data";
import { and, eq } from "drizzle-orm";
import { learningSchema } from "../contract";
import { z } from "zod";
import { buildModel } from "../models";

export type Learning = Omit<z.infer<typeof learningSchema>, "relevance"> & {
  id: string;
};

export const getLearnings = async (clusterId: string) => {
  return (await db.query.knowledgeLearnings.findMany({
    where: eq(knowledgeLearnings.cluster_id, clusterId),
    with: {
      entities: true,
    },
  })) as Learning[];
};

export const upsertLearning = async (
  clusterId: string,
  learning: Learning & { accepted?: boolean },
) => {
  await db.transaction(async (tx) => {
    await tx
      .insert(knowledgeLearnings)
      .values({
        id: learning.id,
        summary: learning.summary,
        accepted: learning.accepted ?? false,
        cluster_id: clusterId,
      })
      .onConflictDoUpdate({
        where: and(
          eq(knowledgeLearnings.cluster_id, clusterId),
          eq(knowledgeLearnings.id, learning.id),
        ),
        set: {
          accepted: learning.accepted ?? false,
        },
        target: [knowledgeLearnings.cluster_id, knowledgeLearnings.id],
      });

    await tx
      .insert(knowledgeEntities)
      .values(
        learning.entities.map((entity) => ({
          ...entity,
          cluster_id: clusterId,
          learning_id: learning.id,
        })),
      )
      .onConflictDoNothing();
  });
};

/**
 * Merge two sets of learnings.
 * Duplicates are discarded.
 * If a duplicate specifies a new entity, the new entity is appended to the existing learning's entity list.
 */
export const mergeLearnings = async ({
  newLearnings,
  existingLearnings,
  clusterId,
  attempts = 0,
}: {
  newLearnings: Learning[];
  existingLearnings: Learning[];
  clusterId: string;
  attempts?: number;
}): Promise<Learning[]> => {
  const system = [
    `A learning is a piece of information about a tool that is relevant to the system.`,
    `Evaluate the existing and new learnings in the system and identify which are duplicates.`,
    `A duplicate is defined as a learning describing the same information.`,
  ].join("\n");

  const schema = z.object({
    duplicates: z
      .record(
        z
          // @ts-expect-error: We don't care about the type information here, but we want to constrain the choices
          .enum(existingLearnings.map((l) => l.id) as string[] as const)
          .describe("The existing learning ID"),
        z
          .array(z.string())
          .describe(
            "The IDs of all the learnings that are duplicates of the existing learning.",
          ),
      )
      .optional(),
  });

  const model = buildModel({
    identifier: "claude-3-5-sonnet",
    trackingOptions: {
      clusterId,
    },
    purpose: "learnings.merge",
  });

  // Strip out other fields from the learnings (entities, etc)
  const prepared = {
    existing: existingLearnings.map((l) => ({ id: l.id, summary: l.summary })),
    new: newLearnings.map((l) => ({ id: l.id, summary: l.summary })),
  };

  const result = await model.structured({
    system,
    schema,
    messages: [
      {
        role: "user",
        content: `<EXISTING>
${prepared.existing.map((learning) => JSON.stringify(learning, null, 2)).join("\n")}
</EXISTING>
<NEW>
${prepared.new.map((learning) => JSON.stringify(learning, null, 2)).join("\n")}
</NEW>`,
      },
    ],
  });

  if (!result.parsed.success) {
    if (attempts >= 5) {
      throw new Error("Failed to parse mergeLearnings output after 5 attempts");
    }

    logger.info("Failed to parse mergeLearnings output, retrying", {
      attempts,
    });

    return mergeLearnings({
      newLearnings,
      existingLearnings,
      clusterId,
      attempts: attempts + 1,
    });
  }

  const duplicateLookup = result.parsed.data.duplicates ?? {};

  return [
    // Attach any new entities to existing learnings
    ...existingLearnings.map((existing) => ({
      ...existing,
      entities: [
        ...existing.entities,
        ...newLearnings
          .filter((newLearning) =>
            duplicateLookup[existing.id]?.includes(newLearning.id),
          )
          .flatMap((newLearning) => newLearning.entities)
          .filter(
            (entity) =>
              !existing.entities.some(
                (existingEntity) => existingEntity.name === entity.name,
              ),
          ),
      ],
    })),
    // Add new learnings, filtering out any duplicates
    ...newLearnings.filter(
      (newLearning) =>
        !Object.values(duplicateLookup).flat().includes(newLearning.id),
    ),
  ];
};
