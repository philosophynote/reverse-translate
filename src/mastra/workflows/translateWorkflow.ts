import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";

const translateToEnglishStep = createStep({
  id: "translate-to-english",
  inputSchema: z.object({
    message: z.string(),
  }),
  outputSchema: z.object({
    englishQuestion: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { message } = inputData;
    const translateAgent = mastra.getAgent("translateAgent");
    const englishQuestionResult = await translateAgent.generate(
      `Translate to English:\n${message}`
    );

    const englishQuestion = (englishQuestionResult.text ?? "").trim();

    return {
      englishQuestion,
    };
  },
});

const answerInEnglishStep = createStep({
  id: "answer-in-english",
  inputSchema: z.object({
    englishQuestion: z.string(),
  }),
  outputSchema: z.object({
    englishQuestion: z.string(),
    englishAnswer: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { englishQuestion } = inputData;
    const assistantAgent = mastra.getAgent("assistantAgent");
    const englishAnswerResult = await assistantAgent.generate(
      `Please answer the following user question in English only. Keep the answer concise yet complete.\nQuestion: ${englishQuestion}`
    );

    const englishAnswer = (englishAnswerResult.text ?? "").trim();

    return {
      englishQuestion,
      englishAnswer,
    };
  },
});

const translateEnglishAnswerToGermanStep = createStep({
  id: "translate-english-answer-to-german",
  inputSchema: z.object({
    englishQuestion: z.string(),
    englishAnswer: z.string(),
  }),
  outputSchema: z.object({
    englishQuestion: z.string(),
    germanAnswerFromEnglish: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { englishQuestion, englishAnswer } = inputData;
    const translateAgent = mastra.getAgent("translateAgent");
    const germanAnswerFromEnglishResult = await translateAgent.generate(
      `Translate to German:\n${englishAnswer}`
    );

    const germanAnswerFromEnglish = (germanAnswerFromEnglishResult.text ?? "").trim();

    return {
      englishQuestion,
      germanAnswerFromEnglish,
    };
  },
});

const answerGermanQuestionStep = createStep({
  id: "answer-german-question",
  inputSchema: z.object({
    englishQuestion: z.string(),
    germanAnswerFromEnglish: z.string(),
  }),
  outputSchema: z.object({
    germanAnswer: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { englishQuestion, germanAnswerFromEnglish } = inputData;
    const translateAgent = mastra.getAgent("translateAgent");
    const germanQuestionResult = await translateAgent.generate(
      `Translate to German:\n${englishQuestion}`
    );
    const germanQuestion = (germanQuestionResult.text ?? "").trim();

    const assistantAgent = mastra.getAgent("assistantAgent");
    const germanAnswerResult = await assistantAgent.generate(
      `Bitte beantworte die folgende Frage ausschließlich auf Deutsch.\nFrage: ${germanQuestion}\nZur Orientierung kannst du auch diese direkt übersetzte Antwort berücksichtigen:\n${germanAnswerFromEnglish}`
    );
    const germanAnswer = (germanAnswerResult.text ?? "").trim();

    return {
      germanAnswer,
    };
  },
});

const translateGermanAnswerToJapaneseStep = createStep({
  id: "translate-german-answer-to-japanese",
  inputSchema: z.object({
    germanAnswer: z.string(),
  }),
  outputSchema: z.object({
    finalJapaneseAnswer: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { germanAnswer } = inputData;
    const translateAgent = mastra.getAgent("translateAgent");
    const finalJapaneseAnswerResult = await translateAgent.generate(
      `Translate to Japanese:\n${germanAnswer}`
    );

    const finalJapaneseAnswer = (finalJapaneseAnswerResult.text ?? "").trim();

    return {
      finalJapaneseAnswer,
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
  .then(translateToEnglishStep)
  .then(answerInEnglishStep)
  .then(translateEnglishAnswerToGermanStep)
  .then(answerGermanQuestionStep)
  .then(translateGermanAnswerToJapaneseStep)
  .commit();
