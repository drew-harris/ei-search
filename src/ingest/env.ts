import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    YOUTUBE_API_KEY: z.string(),
    TYPESENSE_API_KEY: z.string(),
    TYPESENSE_HOST: z.string(),
  },

  runtimeEnvStrict: {
    DATABASE_URL: process.env.DATABASE_URL,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    TYPESENSE_API_KEY: process.env.TYPESENSE_API_KEY,
    TYPESENSE_HOST: process.env.TYPESENSE_HOST,
  },

  emptyStringAsUndefined: true,
});
