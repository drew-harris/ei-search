import { html } from "@elysiajs/html";
import { Elysia } from "elysia";
import * as elements from "typed-html";
import { posthog } from "./posthog";

const app = new Elysia()
  .use(html())
  .get("/", ({ html }) =>
    html(
      <BaseHtml>
        <body class="flex w-full flex-col gap-5 h-screen justify-center items-center">
          <EventButton />
        </body>
      </BaseHtml>
    )
  )
  .get("/styles.css", () => Bun.file("./tailwind-gen/styles.css"))
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

const EventButton = () => {
  return <button onclick="posthog.capture('Test Event')">Send event</button>;
};

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
