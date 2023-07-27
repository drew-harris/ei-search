import { html } from "@elysiajs/html";
import { eq, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import * as elements from "typed-html";
import Header from "./components/Header";
import Moment from "./components/Moment";
import { ResultContainer } from "./components/ResultContainer";
import { db } from "./db";
import { episode, moment } from "./db/schema";
import { posthogScript } from "./posthog";

const app = new Elysia()
  .use(html())
  .get("/", ({ html }) =>
    html(
      <BaseHtml>
        <body class="m-5">
          <Header />
          <div class="flex m-2 flex-col items-center">
            <div class="flex bg-white px-3 w-full border border-black md:w-[300px] rounded-md">
              <input
                name="q"
                class="py-2 flex-grow outline-none "
                _="on htmx:afterRequest call posthog.capture('search')"
                hx-get="/search"
                hx-swap="outerHTML"
                hx-trigger="keyup changed delay:300ms, search"
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
    )
  )
  .get("/search", async ({ query }) => {
    try {
      if (typeof query.q != "string" || !query.q) {
        return <ResultContainer></ResultContainer>;
      }

      console.log("QUERY: ", query.q);

      const result = await db
        .select()
        .from(moment)
        .where(
          sql`MATCH (content) AGAINST (${query.q} IN NATURAL LANGUAGE MODE)`
        )
        .limit(30)
        .innerJoin(episode, eq(moment.episodeId, episode.id));

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
  .get("/styles.css", () => Bun.file("./tailwind-gen/styles.css"))
  .get("/spinner", () => Bun.file("./90-ring.svg"))
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

const BaseHtml = ({ children }: elements.Children) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Emergency Intercom Search</title>
  <script src="https://unpkg.com/htmx.org@1.9.3"></script>
  <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
  <link href="/styles.css" rel="stylesheet">
  ${posthogScript}
</head>

${children}
`;
