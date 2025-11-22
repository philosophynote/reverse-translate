import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";

const japaneseToArabicStep = createStep({
  id: "japanese-to-arabic",
  inputSchema: z.object({
    message: z.string(),
  }),
  outputSchema: z.object({
    arabicText: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { message } = inputData;
    const translateAgent = mastra.getAgent("translateAgent");
    const arabicResult = await translateAgent.generate(
      `Translate the following Japanese text into Arabic script. Keep only Arabic characters.\n${message}`
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
    const chuuniAgent = mastra.getAgent("chuuniAgent");
    const japaneseResult = await chuuniAgent.generate(
      `以下の韓国語(ハングル)文を、意味を損なわず日本語へ翻訳しながら、宇宙規模の陰謀と終末的ビジョンが渦巻く厨二病語録へ変換せよ。\n- 原文の出来事を忘れず、過剰な比喩・ルビ・記号を織り交ぜて3文以上で語れ。\n- 読み手を圧倒する長い語りを心がけ、語尾や語調も芝居がかったものにすること。\n- 出力は純粋な日本語のみで、英語やハングルは含めない。\nハングル原文:\n${hangulAnswer}`
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
  .then(japaneseToArabicStep)
  .then(arabicToHieroglyphStep)
  .then(hieroglyphToEnglishStep)
  .then(englishAnswerStep)
  .then(englishToHangulStep)
  .then(hangulToJapaneseStep)
  .commit();
