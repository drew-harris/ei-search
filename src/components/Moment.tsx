import * as elements from "typed-html";
import { Episode, Moment } from "../db/schema";
export default function Moment({
  moment,
  episode,
  query,
}: {
  moment: Moment;
  episode: Episode;
  query?: string;
}) {
  return (
    <div class="text-center border border-black rounded-md bg-white p-2">
      <div class="flex flex-col md:flex-row md:items-start items-center gap-4">
        {episode.thumbnail && (
          <img class="rounded-md md:w-56 w-48" src={episode.thumbnail} />
        )}
        <div class="w-full">
          <div class="text-xl mb-2 font-bold">{episode.title}</div>
          <div>
            <CaptionHighlight content={moment.content} query={query} />
          </div>
          <details>
            <summary class="my-2 cursor-pointer text-lg">
              Open Quote In Video
            </summary>
            <center>
              <iframe
                class="rounded-md md:w-[560px] md:h-[315px]"
                src={`https://www.youtube.com/embed/${episode.id}?start=${moment.timestamp}`}
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
              ></iframe>
            </center>
          </details>
        </div>
      </div>
    </div>
  );
}

interface CaptionHighlightProps {
  content: string;
  query?: string;
}

function CaptionHighlight({ content, query }: CaptionHighlightProps) {
  if (!query) {
    return <div>"...{content}..."</div>;
  }
  if (!content.toLowerCase().includes(query.toLowerCase())) {
    return <div>"...{content}..."</div>;
  } else {
    return (
      <div class="content">
        "...
        {content.replaceAll(
          query.toLowerCase(),
          `<mark>${query.toLowerCase()}</mark>`
        )}
        ..."
      </div>
    );
  }
}
