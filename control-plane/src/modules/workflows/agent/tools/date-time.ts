import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";

export const CURRENT_DATE_TIME_TOOL_NAME = "currentDateTime";

export const buildCurrentDateTimeTool = (): DynamicStructuredTool =>
  new DynamicStructuredTool({
    name: CURRENT_DATE_TIME_TOOL_NAME,
    description: "Retrieves the current date and time in ISO 8601 format.",
    schema: z.object({}),
    func: async () => {
      return new Date().toISOString();
    },
  });
