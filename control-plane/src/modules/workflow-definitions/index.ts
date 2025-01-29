import { z } from "zod";
import { db, workflowDefinitions } from "../data";
import { and, desc, eq, sql } from "drizzle-orm";
import { BadRequestError, NotFoundError } from "../../utilities/errors";
import jsYaml from "js-yaml";
import { WorkflowDefinitionSchema } from "./schema";

const parseYaml = (yaml: string) => {
  try {
    return jsYaml.load(yaml);
  } catch (error) {
    throw new BadRequestError("Invalid YAML");
  }
};

/**
 * Inserts a new workflow definition after validating it against the specification
 * @param params Parameters for inserting the workflow definition
 * @returns The inserted workflow definition
 * @throws {InvalidWorkflowDefinitionError} If the workflow definition is invalid
 */
export async function insertWorkflowDefinition({
  id,
  clusterId,
  definition,
}: {
  id: string;
  clusterId: string;
  definition: string;
}): Promise<typeof workflowDefinitions.$inferSelect> {
  const parsed = parseYaml(definition);

  // Validate the workflow definition against our schema
  try {
    WorkflowDefinitionSchema.parse(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(
        `Invalid workflow definition: ${error.errors.map(e => e.message).join(", ")}`
      );
    }
    throw error;
  }

  // Insert the new workflow definition
  const [inserted] = await db
    .insert(workflowDefinitions)
    .values({
      id,
      cluster_id: clusterId,
      yaml: definition,
      json: parsed,
      version: sql<number>`(select coalesce(max(version), 0) from workflow_definitions where id = ${id} AND cluster_id = ${clusterId}) + 1`,
    })
    .returning();

  return inserted;
}

export async function getWorkflowDefinition({ id, clusterId }: { id: string; clusterId: string }) {
  const [definition] = await db
    .select()
    .from(workflowDefinitions)
    .where(and(eq(workflowDefinitions.id, id), eq(workflowDefinitions.cluster_id, clusterId)))
    .orderBy(desc(workflowDefinitions.version))
    .limit(1);

  if (!definition) {
    throw new NotFoundError(`Workflow definition not found`);
  }

  return definition;
}
