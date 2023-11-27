import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const config = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "production"]).default("production"),
    POSTHOG_KEY: z.string(),
    YOUTUBE_API_KEY: z.string(),
    ALGOLIA_ADMIN_KEY: z.string(),
    ALGOLIA_APP_ID: z.string(),
  },

  runtimeEnv: {
    ...process.env,
  },
  emptyStringAsUndefined: true,
});
