import { BaseHtml } from "..";
import Header from "../components/Header";
import { ResultContainer } from "../components/ResultContainer";

export const Homepage = () => {
  return (
    <BaseHtml>
      <body hx-boost="true" class="m-3 relative">
        <a
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
              hx-trigger="keyup changed delay:300ms, search"
              hx-target="#results"
              placeholder="Search your favorite moments here..."
              hx-indicator=".htmx-indicator"
            ></input>
            <img src="/spinner" width="18" height="18" class="htmx-indicator" />
          </div>
          <ResultContainer />
        </div>
      </body>
    </BaseHtml>
  );
};
