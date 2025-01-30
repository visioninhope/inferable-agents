import { ulid } from "ulid";
import { insertWorkflowDefinition } from ".";
import { createOwner } from "../test/util";
import { executeDefinition, start } from "./executor";
import { getRunsByTag } from "../runs/tags";

describe("executor", () => {
  const yamlDefinition = `version: "1.0"
workflow:
  name: "test-workflow"
  input:
    data: "sample input"
  steps:
    - type: "run"
      id: "step1"
      agent:
        systemPrompt: "You are a helpful assistant"
        input: "Hello, how are you?"
        resultSchema:
          $schema: "http://json-schema.org/draft-07/schema#"
          type: "object"
          properties:
            result:
              type: "string"
              description: "The result of the step"
    - type: "run"
      id: "step2"
      agent:
        systemPrompt: "What would you say to the user?"
        input: "Say analysis of the user's input"
        resultSchema:
          $schema: "http://json-schema.org/draft-07/schema#"
          type: "object"
          properties:
            analysis:
              type: "string"
              description: "The analysis of the step"
      depends_on: ["step1"]
    - type: "run"
      id: "step3"
      agent:
        systemPrompt: "Meow meow meow"
        input: "Say meow meow meow"
        resultSchema:
          $schema: "http://json-schema.org/draft-07/schema#"
          type: "object"
          properties:
            analysis:
              type: "string"
              description: "The analysis of the step"
      depends_on: ["step2"]
  output:
    final_conclusion: "{{ steps.step3.analysis }}"
`;

  beforeAll(async () => {
    await start();
  });

  it("should execute a workflow", async () => {
    const owner = await createOwner();

    const definition = await insertWorkflowDefinition({
      id: ulid(),
      clusterId: owner.clusterId,
      definition: yamlDefinition,
    });

    const result = await executeDefinition({
      id: definition.id,
      clusterId: owner.clusterId,
      input: {},
    });

    let runs = await getRunsByTag({
      clusterId: owner.clusterId,
      key: "workflow",
      value: "test-workflow",
    });

    while (runs.length < 3) {
      await new Promise(resolve => setTimeout(resolve, 100));
      runs = await getRunsByTag({
        clusterId: owner.clusterId,
        key: "workflow",
        value: "test-workflow",
      });
    }
  });
});
