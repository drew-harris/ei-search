import * as elements from "typed-html";
import { Attributes } from "typed-html";

export const ResultContainer = ({ children }: Attributes) => {
  return (
    <div id="results" class="flex flex-col my-8 max-w-5xl gap-3">
      {children}
    </div>
  );
};
