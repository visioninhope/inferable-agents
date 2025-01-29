import { getWorkflowDefinition, insertWorkflowDefinition } from "./index";
import { db, workflowDefinitions } from "../data";
import { BadRequestError, NotFoundError } from "../../utilities/errors";
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
      definition: validWorkflowYaml,
    });

    expect(result.id).toBe("test-id");
    expect(result.cluster_id).toBe(owner.clusterId);
    expect(result.yaml).toBe(validWorkflowYaml);
    expect(result.version).toBe(1);

    // Verify we can retrieve it from the database
    const retrieved = await getWorkflowDefinition({ id: "test-id", clusterId: owner.clusterId });

    expect(retrieved.id).toEqual(result.id);
    expect(retrieved.cluster_id).toEqual(result.cluster_id);
    expect(retrieved.yaml).toEqual(result.yaml);
    expect(retrieved.version).toEqual(result.version);
  });

  it("should increment version for existing workflow", async () => {
    const owner = await createOwner();

    // Insert first version
    await insertWorkflowDefinition({
      id: "test-id",
      clusterId: owner.clusterId,
      definition: validWorkflowYaml,
    });

    // Insert second version
    const result = await insertWorkflowDefinition({
      id: "test-id",
      clusterId: owner.clusterId,
      definition: validWorkflowYaml,
    });

    expect(result.version).toBe(2);
  });

  it("should throw BadRequestError for invalid YAML", async () => {
    const owner = await createOwner();
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
        definition: invalidYaml,
      })
    ).rejects.toThrow(BadRequestError);

    // Verify nothing was inserted
    expect(getWorkflowDefinition({ id: "test-id", clusterId: owner.clusterId })).rejects.toThrow(
      NotFoundError
    );
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
        definition: invalidSchemaYaml,
      })
    ).rejects.toThrow(BadRequestError);

    // Verify nothing was inserted
    expect(getWorkflowDefinition({ id: "test-id", clusterId: owner.clusterId })).rejects.toThrow(
      NotFoundError
    );
  });
});
