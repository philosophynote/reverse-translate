import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";

const translateStep = createStep({
  id: "translate-step",
  inputSchema: z.object({
    message: z.string(),
  }),
  outputSchema: z.object({
    originalMessage: z.string(),
    translatedMessage: z.string(),
    thinking: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { message } = inputData;

    // 思考プロセス
    const thinking = `翻訳プロセス:
1. 入力言語を検出
2. 元のメッセージ: 「${message}」
3. Claude 3.7 Sonnetを使用して英語に翻訳
4. 翻訳結果を返す`;

    // 翻訳エージェントを取得して実行
    const translateAgent = mastra.getAgent("translateAgent");
    const translationResult = await translateAgent.generate(message);

    return {
      originalMessage: message,
      translatedMessage: translationResult.text,
      thinking,
    };
  },
});

export const translateWorkflow = createWorkflow({
  id: "translate-workflow",
  inputSchema: z.object({
    message: z.string().describe("翻訳する元のメッセージ"),
  }),
  outputSchema: z.object({
    originalMessage: z.string().describe("元のメッセージ"),
    translatedMessage: z.string().describe("英語に翻訳されたメッセージ"),
    thinking: z.string().describe("翻訳プロセスの思考"),
  }),
})
  .then(translateStep)
  .commit();
