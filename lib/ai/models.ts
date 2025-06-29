// import { createDeepSeek } from "@ai-sdk/deepseek";
// import { createXai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// export const deepseek = createDeepSeek({
//   apiKey: process.env.DEEPSEEK_API_KEY ?? "",
// });

// export const grok = createXai({
//   apiKey: process.env.GROK_API_KEY ?? "",
// });

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});
