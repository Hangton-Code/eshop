import { defineConfig } from "drizzle-kit";
import { confidentialEnv } from "./lib/env";

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: confidentialEnv.DATABASE_URL,
  },
});
