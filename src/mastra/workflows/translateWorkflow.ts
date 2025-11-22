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

const arabicToHieroglyphStep = createStep({
  id: "arabic-to-hieroglyph",
  inputSchema: z.object({
    arabicText: z.string(),
  }),
  outputSchema: z.object({
    hieroglyphText: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { arabicText } = inputData;
    const translateAgent = mastra.getAgent("translateAgent");
    const hieroglyphResult = await translateAgent.generate(
      `Translate the following Arabic text into a row of emoji that mimic ancient Egyptian hieroglyphs.\nRules:\n1. Output ONLY emoji characters (animals, celestial bodies, objects, mystical symbols). Examples: 🐍 🦅 🌞 🌙 🦂 🏺 🪶 🐫 🗿.\n2. Provide between 8 and 20 emoji separated by spaces.\n3. Absolutely no Latin letters, Arabic script, numbers, or punctuation. Never write English words.\n4. If you need to hint at sounds, repeat emoji patterns instead of letters.\nText:\n${arabicText}`
    );

    return {
      hieroglyphText: (hieroglyphResult.text ?? "").trim(),
    };
  },
});

const hieroglyphToEnglishStep = createStep({
  id: "hieroglyph-to-english",
  inputSchema: z.object({
    hieroglyphText: z.string(),
  }),
  outputSchema: z.object({
    englishQuestion: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { hieroglyphText } = inputData;
    const translateAgent = mastra.getAgent("translateAgent");
    const englishQuestionResult = await translateAgent.generate(
      `Translate the following hieroglyphic description into English while preserving the original intent.\n${hieroglyphText}`
    );

    return {
      englishQuestion: (englishQuestionResult.text ?? "").trim(),
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
    const assistantAgent = mastra.getAgent("assistantAgent");
    const englishAnswerResult = await assistantAgent.generate(
      `Answer the following question in English only. Question: ${englishQuestion}`
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
  .then(arabicToHieroglyphStep)
  .then(hieroglyphToEnglishStep)
  .then(englishAnswerStep)
  .then(englishToHangulStep)
  .then(hangulToJapaneseStep)
  .commit();
