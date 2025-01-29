import { z } from "zod";

export const StepSchema = z.object({
  type: z.literal("run"),
  id: z.string(),
  agent: z.object({
    systemPrompt: z.string(),
    input: z.string(),
    resultSchema: z.record(z.any()),
    attachedFunctions: z
      .array(
        z.object({
          service: z.string(),
          function: z.string(),
        })
      )
      .optional(),
    tags: z.record(z.string()).optional(),
    context: z.record(z.any()).optional(),
  }),
  depends_on: z.array(z.string()).optional(),
  if: z.string().optional(),
  for_each: z.string().optional(),
});

export const WorkflowDefinitionSchema = z.object({
  version: z.literal("1.0"),
  workflow: z.object({
    steps: z.array(StepSchema),
  }),
});
