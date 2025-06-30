import { SearchResponse } from "typesense/lib/Typesense/Documents";
import { TypesenseMoment } from "./db/algolia";
import { useTypesense, TypesenseError } from "./ingest";
import { ResultAsync } from "neverthrow";

export const getResults = (
  query: string,
  distinctId = "default",
): ResultAsync<TypesenseMoment[], TypesenseError> => {
  // const flag = await posthog.getFeatureFlag("use-algolia", distinctId);

  return useTypesense((ts) => {
    return ts.collections("ei").documents().search({
      q: query,
      query_by: "content",
      highlight_full_fields: "content",
      per_page: 30,
    }) as Promise<SearchResponse<TypesenseMoment>>;
  }).map((results) => {
    const hits = results.hits?.map((hit) => {
      return {
        id: hit.document.id,
        content: hit?.highlight?.content?.value || hit.document.content,
        start: hit.document.start,
        videoId: hit.document.videoId,
        youtubeVideoId: hit.document.youtubeVideoId,
        thumbnailUrl: hit.document.thumbnailUrl,
        videoTitle: hit.document.videoTitle,
      } satisfies TypesenseMoment;
    });

    if (!hits) {
      throw new Error("No hits");
    }

    return hits;
  });
};
