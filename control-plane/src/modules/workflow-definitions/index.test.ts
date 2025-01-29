import { insertWorkflowDefinition } from "./index";
import { db, workflowDefinitions } from "../data";
import { BadRequestError } from "../../utilities/errors";
import { eq } from "drizzle-orm";
import { createOwner } from "../test/util";

describe("insertWorkflowDefinition", () => {
  const validWorkflowYaml = `
version: "1.0"
workflow:
  steps:
    - type: run
      id: step1
      agent:
        systemPrompt: "Test prompt"
        input: "Test input"
        resultSchema: {}
`;

  it("should successfully insert a valid workflow definition", async () => {
    const owner = await createOwner();

    const result = await insertWorkflowDefinition({
      id: "test-id",
      clusterId: owner.clusterId,
      description: "Test Workflow",
      definition: validWorkflowYaml,
    });

    expect(result.id).toBe("test-id");
    expect(result.cluster_id).toBe(owner.clusterId);
    expect(result.description).toBe("Test Workflow");
    expect(result.yaml).toBe(validWorkflowYaml);
    expect(result.version).toBe(1);

    // Verify we can retrieve it from the database
    const [retrieved] = await db
      .select()
      .from(workflowDefinitions)
      .where(eq(workflowDefinitions.id, "test-id"));

    expect(retrieved).toEqual(result);
  });

  it("should increment version for existing workflow", async () => {
    const owner = await createOwner();

    // Insert first version
    await insertWorkflowDefinition({
      id: "test-id",
      clusterId: owner.clusterId,
      description: "Test Workflow",
      definition: validWorkflowYaml,
    });

    // Insert second version
    const result = await insertWorkflowDefinition({
      id: "test-id",
      clusterId: owner.clusterId,
      description: "Test Workflow Updated",
      definition: validWorkflowYaml,
    });

    expect(result.version).toBe(2);
  });

  it("should throw BadRequestError for invalid YAML", async () => {
    const invalidYaml = `
      version: "1.0"
      workflow:
        steps:
          - type: run
            id: step1
            agent:
              systemPrompt: "Test prompt
    `; // Note: missing closing quote

    await expect(
      insertWorkflowDefinition({
        id: "test-id",
        clusterId: owner.clusterId,
        description: "Test Workflow",
        definition: invalidYaml,
      })
    ).rejects.toThrow(BadRequestError);

    // Verify nothing was inserted
    const results = await db
      .select()
      .from(workflowDefinitions)
      .where(eq(workflowDefinitions.id, "test-id"));
    expect(results.length).toBe(0);
  });

  it("should throw BadRequestError for invalid workflow schema", async () => {
    const owner = await createOwner();

    const invalidSchemaYaml = `
version: "1.0"
workflow:
  steps:
    - type: invalid_type
      id: step1
      agent:
        systemPrompt: "Test prompt"
        input: "Test input"
        resultSchema: {}
    `;

    await expect(
      insertWorkflowDefinition({
        id: "test-id",
        clusterId: owner.clusterId,
        description: "Test Workflow",
        definition: invalidSchemaYaml,
      })
    ).rejects.toThrow(BadRequestError);

    // Verify nothing was inserted
    const results = await db
      .select()
      .from(workflowDefinitions)
      .where(eq(workflowDefinitions.id, "test-id"));
    expect(results.length).toBe(0);
  });
});
