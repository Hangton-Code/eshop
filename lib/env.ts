import "dotenv/config";
import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  GROK_API_KEY: z.string(),
  OPENROUTER_API_KEY: z.string(),
  DEEPSEEK_API_KEY: z.string(),
  ALIYUN_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  REDIS_URL: z.string(),
  REDIS_PASSWORD: z.string(),
});

export const confidentialEnv = envSchema.parse(process.env);
