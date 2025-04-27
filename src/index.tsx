import { html } from "@elysiajs/html";
import Elysia from "elysia";
import { analytics } from "./analytics";
import Moment from "./components/Moment";
import { ResultContainer } from "./components/ResultContainer";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { feedback } from "./pages/feedback";
import { Homepage } from "./pages/homepage";
import { posthog, posthogScript } from "./posthog";
import { proofRoute } from "./pages/proof";
import { getResults } from "./searching";
import { tracing } from "./tracing";
import { logger } from "./logs";
import { db } from "./db";
import { ingestRoute, typesense } from "./ingest";
import { sendError } from "./handleError";
import cron from "@elysiajs/cron";

if (!process.env.DISCORD_ERROR_WEBHOOK) {
  logger.warn("No discord error webhook");
}

const app = new Elysia()
  .use(html())
  .onError((e) => {
    if (e.error.message === "NOT_FOUND") {
      return;
    }
    sendError(e.error);
  })
  .use(ingestRoute)
  .decorate("typesense", typesense)
  .use(tracing)
  .use(analytics)
  .use(feedback)
  .use(proofRoute)
  .get("/", async () => {
    return await (<Homepage />);
  })
  .get("/hx/search", async ({ query, distinct }) => {
    try {
      if (typeof query.q != "string" || !query.q) {
        return <ResultContainer></ResultContainer>;
      }

      const result = await getResults(query.q, distinct);

      if (distinct) {
        posthog.capture({
          distinctId: distinct,
          event: "search",
          properties: {
            query: query.q,
          },
          timestamp: new Date(),
        });
      }

      logger.info({ query: query.q, resultCount: result.length }, "search");

      if (result.length === 0) {
        return <ResultContainer>no results :(</ResultContainer>;
      }

      return (
        <ResultContainer>
          {result.map((res) => <Moment moment={res} />).join(" ")}
        </ResultContainer>
      );
    } catch (e) {
      console.error(e);
      return (
        <ResultContainer>
          <div>There was an error!!</div>
        </ResultContainer>
      );
    }
  })

  .get("/styles.css", () => {
    return Bun.file("./tailwind-gen/styles.css");
  })
  .get("/spinner", ({ set }) => {
    set.headers["Cache-Control"] = "public, max-age=86400";
    return Bun.file("./90-ring.svg");
  })
  .listen(3000);

logger.info({ app: app.server?.hostname, port: app.server?.port }, "start");

export const BaseHtml = ({ children }: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Emergency Intercom Search</title>
  <script src="https://unpkg.com/htmx.org@1.9.3"></script>
  <link href="/styles.css" rel="stylesheet">
  ${posthogScript}
  <style>
    .htmx-indicator {
        opacity: 0;
        transition: opacity 200ms ease-in;
    }
    </style>
</head>

${children}
`;

export type App = typeof app;

migrate(db, {
  migrationsFolder: "./migrations",
});
