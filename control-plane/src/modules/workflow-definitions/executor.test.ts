import { ulid } from "ulid";
import { insertWorkflowDefinition } from ".";
import { createOwner } from "../test/util";
import { executeDefinition } from "./executor";

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
        input: "Process this data: 1 + 1"
        resultSchema:
          result: "string"
    - type: "run"
      id: "step2"
      agent:
        systemPrompt: "You are a multiplier"
        input: "Multiply the output from step1: {{ steps.step1.result }}"
        resultSchema:
          analysis: "string"
      depends_on: ["step1"]
    - type: "run"
      id: "step3"
      agent:
        systemPrompt: "You are a divider"
        input: "Divide the output from step2: {{ steps.step2.result }}"
        resultSchema:
          analysis: "string"
      depends_on: ["step2"]
  output:
    final_conclusion: "{{ steps.step3.analysis }}"
`;
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

    expect(result).toBeDefined();
  });
});
