import { z } from "zod";
import { db, workflowDefinitions } from "../data";
import { sql } from "drizzle-orm";
import { BadRequestError } from "../../utilities/errors";
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
  description,
  definition,
}: {
  id: string;
  clusterId: string;
  description: string;
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
      description,
      yaml: definition,
      json: parsed,
      version: sql<number>`(select coalesce(max(version), 0) from workflow_definitions where id = ${id}) + 1`,
    })
    .returning();

  return inserted;
}
