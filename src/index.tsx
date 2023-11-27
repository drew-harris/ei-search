import { html } from "@elysiajs/html";
import Elysia, { t } from "elysia";
import { analytics } from "./analytics";
import Header from "./components/Header";
import Moment from "./components/Moment";
import { ResultContainer } from "./components/ResultContainer";
import { AlgoliaMoment, momentsIndex } from "./db/algolia";
import { config } from "./env";
import { feedback } from "./feedback";
import { posthog, posthogScript } from "./posthog";
import { proofRoute } from "./proof";
import { z } from "zod";
import { Optional } from "@sinclair/typebox";

console.log(config.ALGOLIA_APP_ID);

const app = new Elysia()
  .use(html())
  .use(analytics)
  .use(feedback)
  .use(proofRoute)
  .get("/", () => {
    return (
      <BaseHtml>
        <body hx-ext="preload" hx-boost="true" class="m-3 relative">
          <a
            preload="mouseover"
            href="/feedback"
            class="cursor-pointer text-black/50 md:text-black mb-8 hover:underline text-right"
          >
            Submit Feedback
          </a>
          <Header />
          <div class="flex m-2 flex-col items-center">
            <div class="flex bg-white px-3 w-full border border-black mt-5 md:w-[300px] rounded-md">
              <input
                name="q"
                class="py-2 flex-grow outline-none "
                id="search"
                hx-get="/hx/search"
                hx-swap="outerHTML"
                hx-trigger="keyup changed delay:500ms, search"
                hx-target="#results"
                placeholder="Search your favorite moments here..."
                hx-indicator=".htmx-indicator"
              ></input>
              <img
                src="/spinner"
                width="18"
                height="18"
                class="htmx-indicator"
              />
            </div>
            <ResultContainer />
          </div>
        </body>
      </BaseHtml>
    );
  })
  .get("/hx/search", async ({ query, distinct }) => {
    try {
      if (typeof query.q != "string" || !query.q) {
        return <ResultContainer></ResultContainer>;
      }

      console.log("QUERY: ", query.q);

      const results = await momentsIndex.search<AlgoliaMoment>(query.q, {
        cacheable: true,
        restrictHighlightAndSnippetArrays: true,
        removeStopWords: false,
        analytics: true,
        clickAnalytics: true,
      });

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

      if (results.hits.length === 0) {
        return <ResultContainer>no results :(</ResultContainer>;
      }

      let moments = results.hits;
      const mappedMoments = moments.map((m) => {
        return {
          ...m,
          aid: results.queryID,
        };
      });

      return (
        <ResultContainer>
          {mappedMoments.map((res) => <Moment moment={res} />).join(" ")}
        </ResultContainer>
      );
    } catch (e) {
      console.error(e);
    }
  })

  .get(
    "/hx/details",
    ({ distinct, query }) => {
      console.log(query);
      console.log("View details");
    },
    {
      query: t.Object({
        aid: t.Optional(t.String()),
      }),
    }
  )

  .get("/styles.css", ({ set }) => {
    set.headers["Cache-Control"] = "public, max-age=86400";
    return Bun.file("./tailwind-gen/styles.css");
  })
  .get("/spinner", ({ set }) => {
    set.headers["Cache-Control"] = "public, max-age=86400";
    return Bun.file("./90-ring.svg");
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

export const BaseHtml = ({ children }: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Emergency Intercom Search</title>
  <script src="https://unpkg.com/htmx.org@1.9.3"></script>
  <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
  <script src="https://unpkg.com/htmx.org/dist/ext/preload.js"></script>
  <link href="/styles.css" rel="stylesheet">
  ${posthogScript}
</head>

${children}
`;

export type App = typeof app;
