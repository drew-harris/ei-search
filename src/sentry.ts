import * as Sentry from "@sentry/bun";
import { config } from "./env";

export const setupSentry = () => {
  console.log("Setting up sentry");
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
    debug: true,
    environment: config.NODE_ENV,
  });
};

export const sentry = Sentry;
