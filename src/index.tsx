import { html } from "@elysiajs/html";
import { eq, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import Header from "./components/Header";
import Moment from "./components/Moment";
import { ResultContainer } from "./components/ResultContainer";
import { db } from "./db";
import { episode, moment } from "./db/schema";
import { feedback } from "./feedback";
import { posthogScript } from "./posthog";
import { proofRoute } from "./proof";

const app = new Elysia()
  .use(html())
  .use(feedback)
  .use(proofRoute)
  .get("/", ({ set }) => {
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
                _="on htmx:afterRequest call posthog.capture('search', {query: document.getElementById('search').value})"
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
  .get("/hx/search", async ({ query }) => {
    try {
      if (typeof query.q != "string" || !query.q) {
        return <ResultContainer></ResultContainer>;
      }

      console.log("QUERY: ", query.q);

      let result = await db
        .select()
        .from(moment)
        .where(
          sql`MATCH (content) AGAINST (${query.q} IN NATURAL LANGUAGE MODE)`
        )
        .limit(50)
        .innerJoin(episode, eq(moment.episodeId, episode.id));

      let queryString = query.q;
      // if content contains query, move it to the front
      let queryInContent = result.filter((res) =>
        res.moments.content.toLowerCase().includes(queryString.toLowerCase())
      );
      let queryNotInContent = result.filter(
        (res) =>
          !res.moments.content.toLowerCase().includes(queryString.toLowerCase())
      );

      result = [...queryInContent, ...queryNotInContent];

      if (result.length === 0) {
        return <ResultContainer>no results :(</ResultContainer>;
      }

      return (
        <ResultContainer>
          {result
            .map((res) => (
              <Moment
                query={query.q as string}
                moment={res.moments}
                episode={res.episodes}
              ></Moment>
            ))
            .join(" ")}
        </ResultContainer>
      );
    } catch (e) {
      console.error(e);
    }
  })
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
