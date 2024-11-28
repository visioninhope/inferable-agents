import { DynamicStructuredTool } from "@langchain/core/tools";
import { zodToJsonSchema } from "zod-to-json-schema";
import skmeans from "skmeans";

export function toolSchema(tools: DynamicStructuredTool<any>[]) {
  return tools.map((tool) => {
    const jsonSchema = zodToJsonSchema(tool.schema);

    delete jsonSchema.$schema;

    return `${tool.name} - ${tool.description} ${JSON.stringify(jsonSchema)}`;
  });
}

export function mostRelevantKMeansCluster<T extends { similarity: number }>(
  tools: T[],
): T[] {
  const min = Math.min(...tools.map((t) => t.similarity));
  const max = Math.max(...tools.map((t) => t.similarity));

  const p50 = max * 0.5;

  const clusters = skmeans(
    tools.map((t) => t.similarity),
    3,
    [max, p50, min],
  );

  return tools.filter((t, idx) => {
    return clusters.idxs[idx] === 0;
  });
}
