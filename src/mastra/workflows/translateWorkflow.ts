import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";

const japaneseToChuuniStep = createStep({
  id: "japanese-to-chuuni",
  inputSchema: z.object({
    message: z.string(),
  }),
  outputSchema: z.object({
    chuuniJapanese: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { message } = inputData;
    const chuuniAgent = mastra.getAgent("chuuniAgent");
    const chuuniResult = await chuuniAgent.generate(
      `以下の日本語原文を、宇宙規模の陰謀や異界の理が交錯する厨二病語録へと変換せよ。\n- 原文の出来事や意味を保ちつつ、過剰な比喩・ルビ・記号を編み込み、3文以上で語ること。\n- 語り口は芝居がかった日本語のみで、英語や絵文字は使わない。\n原文:\n${message}`
    );

    return {
      chuuniJapanese: (chuuniResult.text ?? "").trim(),
    };
  },
});

const chuuniToArabicStep = createStep({
  id: "chuuni-to-arabic",
  inputSchema: z.object({
    chuuniJapanese: z.string(),
  }),
  outputSchema: z.object({
    arabicText: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { chuuniJapanese } = inputData;
    const translateAgent = mastra.getAgent("translateAgent");
    const arabicResult = await translateAgent.generate(
      `Translate the following Japanese text into Arabic script. Keep only Arabic characters.\n${chuuniJapanese}`
    );

    return {
      arabicText: (arabicResult.text ?? "").trim(),
    };
  },
});

const arabicToEnglishStep = createStep({
  id: "arabic-to-english",
  inputSchema: z.object({
    arabicText: z.string(),
  }),
  outputSchema: z.object({
    englishQuestion: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { arabicText } = inputData;
    const translateAgent = mastra.getAgent("translateAgent");
    const englishResult = await translateAgent.generate(
      `Translate the following Arabic text into English while preserving the nuance, tone, and any implied questions.\n${arabicText}`
    );

    return {
      englishQuestion: (englishResult.text ?? "").trim(),
    };
  },
});

const englishAnswerStep = createStep({
  id: "english-answer",
  inputSchema: z.object({
    englishQuestion: z.string(),
  }),
  outputSchema: z.object({
    englishAnswer: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { englishQuestion } = inputData;
    const trumpAgent = mastra.getAgent("trumpAgent");
    const englishAnswerResult = await trumpAgent.generate(
      `Answer the following question using Donald Trump's trademark tone: confident, boastful, and direct. Stay on topic and keep it in English only. Question: ${englishQuestion}`
    );

    return {
      englishAnswer: (englishAnswerResult.text ?? "").trim(),
    };
  },
});

const englishToHangulStep = createStep({
  id: "english-to-hangul",
  inputSchema: z.object({
    englishAnswer: z.string(),
  }),
  outputSchema: z.object({
    hangulAnswer: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { englishAnswer } = inputData;
    const translateAgent = mastra.getAgent("translateAgent");
    const hangulResult = await translateAgent.generate(
      `Translate the following English text into Korean (Hangul) only.\n${englishAnswer}`
    );

    return {
      hangulAnswer: (hangulResult.text ?? "").trim(),
    };
  },
});

const hangulToJapaneseStep = createStep({
  id: "hangul-to-japanese",
  inputSchema: z.object({
    hangulAnswer: z.string(),
  }),
  outputSchema: z.object({
    finalJapaneseAnswer: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { hangulAnswer } = inputData;
    const translateAgent = mastra.getAgent("translateAgent");
    const japaneseResult = await translateAgent.generate(
      `Translate the following Korean (Hangul) text into natural Japanese. Keep sentences clear and readable without additional embellishment.\n${hangulAnswer}`
    );

    return {
      finalJapaneseAnswer: (japaneseResult.text ?? "").trim(),
    };
  },
});

export const translateWorkflow = createWorkflow({
  id: "translate-workflow",
  inputSchema: z.object({
    message: z.string().describe("翻訳する元のメッセージ"),
  }),
  outputSchema: z.object({
    finalJapaneseAnswer: z.string().describe("最終的な日本語での回答"),
  }),
})
  .then(japaneseToChuuniStep)
  .then(chuuniToArabicStep)
  .then(arabicToEnglishStep)
  .then(englishAnswerStep)
  .then(englishToHangulStep)
  .then(hangulToJapaneseStep)
  .commit();
