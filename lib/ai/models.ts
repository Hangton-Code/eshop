import { createDeepSeek } from "@ai-sdk/deepseek";
import { createXai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { confidentialEnv } from "../env";

export const deepseek = createDeepSeek({
  apiKey: confidentialEnv.DEEPSEEK_API_KEY ?? "",
});

export const grok = createXai({
  apiKey: confidentialEnv.GROK_API_KEY ?? "",
});

export const openrouter = createOpenRouter({
  apiKey: confidentialEnv.OPENROUTER_API_KEY,
});
