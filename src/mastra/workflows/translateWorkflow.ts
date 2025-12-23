import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";

const stageLogSchema = z.array(
  z.object({
    id: z.string(),
    label: z.string(),
    input: z.string(),
    output: z.string(),
    model: z.string().optional(),
  })
);

const japaneseToChuuniStep = createStep({
  id: "japanese-to-chuuni",
  inputSchema: z.object({
    message: z.string(),
  }),
  outputSchema: z.object({
    chuuniJapanese: z.string(),
    stages: stageLogSchema,
  }),
  execute: async ({ inputData, mastra }) => {
    const { message } = inputData;
    const chuuniAgent = mastra.getAgent("chuuniAgent");
    const selectedModel = await chuuniAgent.getModel();
    const modelName = typeof selectedModel === "string" ? selectedModel : selectedModel.modelId || "unknown";

    const chuuniResult = await chuuniAgent.generate(
      `以下の日本語原文を、宇宙規模の陰謀や異界の理が交錙する厨二病語録へと変換せよ。\n- 原文の出来事や意味を保ちつつ、過剩な比喩・ルビ・記号を編み込み、3文以上で語ること。\n- 語り口は芝居がかった日本語のみで、英語や絵文字は使わない。\n原文:\n${message}`
    );

    const chuuniJapanese = (chuuniResult.text ?? "").trim();

    return {
      chuuniJapanese,
      stages: [
        {
          id: "japanese-to-chuuni",
          label: "日本語→厨二病語録",
          input: message,
          output: chuuniJapanese,
          model: modelName,
        },
      ],
    };
  },
});

const chuuniToArabicStep = createStep({
  id: "chuuni-to-arabic",
  inputSchema: z.object({
    chuuniJapanese: z.string(),
    stages: stageLogSchema,
  }),
  outputSchema: z.object({
    arabicText: z.string(),
    stages: stageLogSchema,
  }),
  execute: async ({ inputData, mastra }) => {
    const { chuuniJapanese, stages } = inputData;
    const translateAgent = mastra.getAgent("translateAgent");
    const selectedModel = await translateAgent.getModel();
    const modelName = typeof selectedModel === "string" ? selectedModel : selectedModel.modelId || "unknown";

    const arabicResult = await translateAgent.generate(
      `Translate the following Japanese text into Arabic script. Keep only Arabic characters.\n${chuuniJapanese}`
    );

    const arabicText = (arabicResult.text ?? "").trim();

    return {
      arabicText,
      stages: [
        ...stages,
        {
          id: "chuuni-to-arabic",
          label: "厨二日本語→アラビア文字",
          input: chuuniJapanese,
          output: arabicText,
          model: modelName,
        },
      ],
    };
  },
});

const arabicToEnglishStep = createStep({
  id: "arabic-to-english",
  inputSchema: z.object({
    arabicText: z.string(),
    stages: stageLogSchema,
  }),
  outputSchema: z.object({
    englishQuestion: z.string(),
    stages: stageLogSchema,
  }),
  execute: async ({ inputData, mastra }) => {
    const { arabicText, stages } = inputData;
    const translateAgent = mastra.getAgent("translateAgent");
    const selectedModel = await translateAgent.getModel();
    const modelName = typeof selectedModel === "string" ? selectedModel : selectedModel.modelId || "unknown";

    const englishResult = await translateAgent.generate(
      `Translate the following Arabic text into English while preserving the nuance, tone, and any implied questions.\n${arabicText}`
    );

    const englishQuestion = (englishResult.text ?? "").trim();

    return {
      englishQuestion,
      stages: [
        ...stages,
        {
          id: "arabic-to-english",
          label: "アラビア文字→英語",
          input: arabicText,
          output: englishQuestion,
          model: modelName,
        },
      ],
    };
  },
});

const englishAnswerStep = createStep({
  id: "english-answer",
  inputSchema: z.object({
    englishQuestion: z.string(),
    stages: stageLogSchema,
  }),
  outputSchema: z.object({
    englishAnswer: z.string(),
    stages: stageLogSchema,
  }),
  execute: async ({ inputData, mastra }) => {
    const { englishQuestion, stages } = inputData;
    const trumpAgent = mastra.getAgent("trumpAgent");
    const selectedModel = await trumpAgent.getModel();
    const modelName = typeof selectedModel === "string" ? selectedModel : selectedModel.modelId || "unknown";

    const englishAnswerResult = await trumpAgent.generate(
      `Answer the following question using Donald Trump's trademark tone: confident, boastful, and direct. Stay on topic and keep it in English only. Question: ${englishQuestion}`
    );

    const englishAnswer = (englishAnswerResult.text ?? "").trim();

    return {
      englishAnswer,
      stages: [
        ...stages,
        {
          id: "english-answer",
          label: "英語回答",
          input: englishQuestion,
          output: englishAnswer,
          model: modelName,
        },
      ],
    };
  },
});

const englishToNetSlangStep = createStep({
  id: "english-to-net-slang",
  inputSchema: z.object({
    englishAnswer: z.string(),
    stages: stageLogSchema,
  }),
  outputSchema: z.object({
    netSlangEnglish: z.string(),
    stages: stageLogSchema,
  }),
  execute: async ({ inputData, mastra }) => {
    const { englishAnswer, stages } = inputData;
    const netSlangAgent = mastra.getAgent("netSlangAgent");
    const selectedModel = await netSlangAgent.getModel();
    const modelName = typeof selectedModel === "string" ? selectedModel : selectedModel.modelId || "unknown";

    const netSlangResult = await netSlangAgent.generate(englishAnswer);

    const netSlangEnglish = (netSlangResult.text ?? "").trim();

    return {
      netSlangEnglish,
      stages: [
        ...stages,
        {
          id: "english-to-net-slang",
          label: "英語→ネットスラング英語",
          input: englishAnswer,
          output: netSlangEnglish,
          model: modelName,
        },
      ],
    };
  },
});

const englishToHangulStep = createStep({
  id: "english-to-hangul",
  inputSchema: z.object({
    netSlangEnglish: z.string(),
    stages: stageLogSchema,
  }),
  outputSchema: z.object({
    hangulAnswer: z.string(),
    stages: stageLogSchema,
  }),
  execute: async ({ inputData, mastra }) => {
    const { netSlangEnglish, stages } = inputData;
    const translateAgent = mastra.getAgent("translateAgent");
    const selectedModel = await translateAgent.getModel();
    const modelName = typeof selectedModel === "string" ? selectedModel : selectedModel.modelId || "unknown";

    const hangulResult = await translateAgent.generate(
      `Translate the following English text into Korean (Hangul) only.\n${netSlangEnglish}`
    );

    const hangulAnswer = (hangulResult.text ?? "").trim();

    return {
      hangulAnswer,
      stages: [
        ...stages,
        {
          id: "english-to-hangul",
          label: "ネットスラング英語→ハングル",
          input: netSlangEnglish,
          output: hangulAnswer,
          model: modelName,
        },
      ],
    };
  },
});

const hangulToJapaneseStep = createStep({
  id: "hangul-to-japanese",
  inputSchema: z.object({
    hangulAnswer: z.string(),
    stages: stageLogSchema,
  }),
  outputSchema: z.object({
    finalJapaneseAnswer: z.string(),
    stages: stageLogSchema,
  }),
  execute: async ({ inputData, mastra }) => {
    const { hangulAnswer, stages } = inputData;
    const translateAgent = mastra.getAgent("translateAgent");
    const selectedModel = await translateAgent.getModel();
    const modelName = typeof selectedModel === "string" ? selectedModel : selectedModel.modelId || "unknown";

    const japaneseResult = await translateAgent.generate(
      `Translate the following Korean (Hangul) text into natural Japanese. Keep sentences clear and readable without additional embellishment.\n${hangulAnswer}`
    );

    const finalJapaneseAnswer = (japaneseResult.text ?? "").trim();

    return {
      finalJapaneseAnswer,
      stages: [
        ...stages,
        {
          id: "hangul-to-japanese",
          label: "ハングル→日本語",
          input: hangulAnswer,
          output: finalJapaneseAnswer,
          model: modelName,
        },
      ],
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
    stages: stageLogSchema,
  }),
})
  .then(japaneseToChuuniStep)
  .then(chuuniToArabicStep)
  .then(arabicToEnglishStep)
  .then(englishAnswerStep)
  .then(englishToNetSlangStep)
  .then(englishToHangulStep)
  .then(hangulToJapaneseStep)
  .commit();
