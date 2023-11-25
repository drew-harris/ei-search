import { html } from "@elysiajs/html";
import Elysia, { t } from "elysia";
import { BaseHtml } from ".";
import { db } from "./db";
import { feedbackTable } from "./db/schema";

export const feedback = new Elysia()
  .use(html())
  .get("/feedback", () => {
    return (
      <BaseHtml>
        <div class="p-3">
          <a href="/" class="cursor-pointer hover:underline text-right">
            Back
          </a>
          <div class="text-center md:text-3xl text-xl font-bold">
            Submit Feedback!!!!!!
          </div>
          <div class="text-center">
            Can't find something? Site broken? Just want to say something?
          </div>
          <form hx-post="/hx/feedback" class="flex flex-col py-8 items-center">
            <textarea
              name="feedback"
              required
              minlength={1}
              rows="4"
              placeholder="Enter feedback here..."
              class="flex bg-white p-3 border border-black md:w-[50%] w-[90%] rounded-md"
            ></textarea>
            <button
              class="mt-5 disabled:text-black/50 font-semibold"
              role="submit"
            >
              Submit
            </button>
          </form>
        </div>
      </BaseHtml>
    );
  })
  .post(
    "/hx/feedback",
    async ({ body }) => {
      try {
        await db.insert(feedbackTable).values({
          content: body.feedback,
          submittedAt: new Date(),
        });

        return (
          <>
            <div class="text-center my-2 text-black/80 max-w-[500px] m-auto">
              Thanks for your feedback!
            </div>
            <a href="/" class="mt-4 underline">
              Back
            </a>
          </>
        );
      } catch (error) {
        return (
          <>
            <div class="text-center text-red-700 my-2 text-black/80 max-w-[500px] m-auto">
              There was an error submitting your feedback.
            </div>
            <a href="/" class="mt-4 underline">
              Back
            </a>
          </>
        );
      }
    },
    {
      body: t.Object({
        feedback: t.String(),
      }),
    }
  );
