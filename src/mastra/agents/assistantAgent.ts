import { Agent } from "@mastra/core/agent";
import { bedrock } from "@ai-sdk/amazon-bedrock";


export const assistantAgent = new Agent({
  name: "assistant",
  instructions: "あなたは親切で知識豊富なAIアシスタントです。ユーザーの質問に対して、わかりやすく丁寧に回答してください。",
  model: () => {
    const models = [
      bedrock("us.anthropic.claude-haiku-4-5-20251001-v1:0"),
      "xai/grok-3-mini-fast-latest"
    ];
    return models[Math.floor(Math.random() * models.length)];
  },
});
