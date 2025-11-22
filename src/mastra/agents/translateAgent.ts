import { Agent } from "@mastra/core/agent";
import { bedrock } from "@ai-sdk/amazon-bedrock";

export const translateAgent = new Agent({
  name: "translate-agent",
  instructions: `You are a professional translator.
Translate the user's input from any language to English.
Maintain the original meaning, tone, and nuance.
Provide only the translated text without any additional explanations.`,
  model: bedrock("us.anthropic.claude-3-7-sonnet-20250219-v1:0"),
});
