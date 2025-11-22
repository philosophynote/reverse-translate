import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";

const step1 = createStep({
  id: "step-1",
  inputSchema: z.object({
    value: z.string(),
  }),
  outputSchema: z.object({
    value: z.string(),
  }),
  execute: async ({ inputData }) => {
    return {
      value: inputData.value,
    };
  },
});

export const testWorkflow = createWorkflow({
  id: "test-workflow",
  inputSchema: z.object({
    value: z.string().describe("入力文字列"),
  }),
  outputSchema: z.object({
    value: z.string().describe("出力文字列"),
  }),
})
  .then(step1)
  .commit();
