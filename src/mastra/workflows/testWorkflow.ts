import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";

const chatStep = createStep({
  id: "chat-step",
  inputSchema: z.object({
    message: z.string(),
  }),
  outputSchema: z.object({
    response: z.string(),
    thinking: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { message } = inputData;

    // 思考プロセスをシミュレート
    const thinking = `思考プロセス:
1. ユーザーのメッセージ「${message}」を分析
2. コンテキストを理解
3. 適切な応答を生成
4. 結果をフォーマット`;

    // AIの応答を生成（実際のAI処理に置き換え可能）
    const response = `「${message}」についてのAI応答です。このメッセージは ${message.length} 文字です。`;

    return {
      response,
      thinking,
    };
  },
});

export const testWorkflow = createWorkflow({
  id: "test-workflow",
  inputSchema: z.object({
    message: z.string().describe("ユーザーのチャットメッセージ"),
  }),
  outputSchema: z.object({
    response: z.string().describe("AIの応答"),
    thinking: z.string().describe("思考プロセス"),
  }),
})
  .then(chatStep)
  .commit();
