import * as Sentry from "@sentry/bun";
import { config } from "./env";

export const setupSentry = () => {
  console.log("Setting up sentry");
  Sentry.init({
    // Dsn loaded through environment variable
    tracesSampleRate: 1.0,
    environment: config.NODE_ENV,
  });
};

export const sentry = Sentry;
