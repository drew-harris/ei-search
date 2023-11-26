import { html } from "@elysiajs/html";
import Elysia from "elysia";
import { BaseHtml } from ".";

export const proofRoute = new Elysia().use(html()).get("/proof", () => {
  return (
    <BaseHtml>
      <div class="p-3">
        <a href="/" class="cursor-pointer hover:underline text-right">
          Back
        </a>
        <div class="text-center">@dot_net_ on TikTok!</div>
      </div>
    </BaseHtml>
  );
});
