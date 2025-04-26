import { SearchResponse } from "typesense/lib/Typesense/Documents";
import { TypesenseMoment } from "./db/algolia";
import { typesense } from "./ingest";

export const getResults = async (
  query: string,
  distinctId = "default",
): Promise<TypesenseMoment[]> => {
  // const flag = await posthog.getFeatureFlag("use-algolia", distinctId);

  const results = (await typesense.collections("ei").documents().search({
    q: query,
    query_by: "content",
    highlight_full_fields: "content",
    per_page: 30,
  })) as SearchResponse<TypesenseMoment>;

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
};
