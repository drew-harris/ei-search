import * as Sentry from "@sentry/bun";
import { config } from "./env";
import { logger } from "./logs";

export const setupSentry = () => {
  logger.info("setting up sentry");
  Sentry.init({
    // Dsn loaded through environment variable
    autoSessionTracking: false,
    integrations: [
      new Sentry.Integrations.Console(),
      new Sentry.Integrations.BunServer(),
    ],
    defaultIntegrations: false,
    enableTracing: false,
    attachStacktrace: false,
    sendClientReports: false,
    instrumenter: undefined,
    tracePropagationTargets: [],
    environment: config.NODE_ENV,
  });
};

export const sentry = Sentry;
