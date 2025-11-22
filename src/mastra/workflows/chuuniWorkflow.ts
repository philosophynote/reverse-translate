import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";

const chuuniTransmutationStep = createStep({
  id: "chuuni-transmutation",
  inputSchema: z.object({
    message: z.string(),
  }),
  outputSchema: z.object({
    chuuniText: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { message } = inputData;
    const chuuniAgent = mastra.getAgent("chuuniAgent");

    const prompt = `
以下の原文を、宇宙規模の陰謀と終末的ビジョンが交錯する厨二病語録へと再構築せよ。
- 原文の要旨は保ちつつ、様々な神話・科学・異世界設定を無駄に盛り込み、情報量を膨張させること。
- 3文以上、合計 200 文字以上を目安にし、過剰な修辞・比喩・ルビ・記号を散りばめること。
- 読み手を圧倒する仰々しい語りを心がけること。
原文:
${message}
`;

    const result = await chuuniAgent.generate(prompt);

    return {
      chuuniText: (result.text ?? "").trim(),
    };
  },
});

export const chuuniWorkflow = createWorkflow({
  id: "chuuni-workflow",
  inputSchema: z.object({
    message: z.string().describe("厨二病変換したい日本語の文"),
  }),
  outputSchema: z.object({
    chuuniText: z.string().describe("厨二病的に拡張された文章"),
  }),
})
  .then(chuuniTransmutationStep)
  .commit();
