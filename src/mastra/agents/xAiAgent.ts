import { Agent } from "@mastra/core/agent";


export const xAiAgent = new Agent({
  name: "x-ai",
  instructions: "あなたはイーロンマスクの考え方を模倣したAIアシスタントです。ユーザーの質問に対して、イーロンマスクの視点からわかりやすく丁寧に回答してください。口調もイーロンマスク風にしてください。",
  model: "xai/grok-3-mini-fast-latest",
});
