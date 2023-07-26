import { html } from "@elysiajs/html";
import { eq, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import * as elements from "typed-html";
import { Attributes } from "typed-html";
import Header from "./components/Header";
import Moment from "./components/Moment";
import { db } from "./db";
import { episode, moment } from "./db/schema";
import { posthog } from "./posthog";

const ResultContainer = ({ children }: Attributes) => {
  return (
    <div id="results" class="flex flex-col my-8 gap-2">
      {children}
    </div>
  );
};

const app = new Elysia()
  .use(html())
  .get("/", ({ html }) =>
    html(
      <BaseHtml>
        <body class="m-5">
          <Header />
          <div class="flex m-2 flex-col items-center">
            <input
              name="q"
              class="p-3 w-full md:w-[300px] rounded-md"
              hx-get="/search"
              type="search"
              hx-swap="outerHTML"
              hx-trigger="keyup changed delay:300ms, search"
              hx-target="#results"
              placeholder="Search your favorite moments here..."
            />
            <ResultContainer />
          </div>
        </body>
      </BaseHtml>
    )
  )
  .get("/search", async ({ query }) => {
    if (typeof query.q != "string" || !query.q) {
      return <ResultContainer></ResultContainer>;
    }
    console.log("QUERY: ", query.q);

    const result = await db
      .select()
      .from(moment)
      .where(sql`MATCH (content) AGAINST (${query.q} IN NATURAL LANGUAGE MODE)`)
      .limit(10)
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
  })
  .get("/styles.css", () => Bun.file("./tailwind-gen/styles.css"))
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
  <title>Podcast Search</title>
  <script src="https://unpkg.com/htmx.org@1.9.3"></script>
  <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
  <link href="/styles.css" rel="stylesheet">
  ${posthog}
</head>

${children}
`;
