import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const config = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "production"]).default("production"),
    POSTHOG_KEY: z.string(),
    YOUTUBE_API_KEY: z.string(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    POSTHOG_KEY: process.env.POSTHOG_KEY,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  },
  emptyStringAsUndefined: true,
});
