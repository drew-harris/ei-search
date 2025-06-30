import { SearchResponse } from "typesense/lib/Typesense/Documents";
import { TypesenseError, useTypesense } from "../ingest";
import { ResultAsync } from "neverthrow";

export namespace Search {
  export type TypesenseMoment = {
    id: string;
    content: string;
    start: number;
    videoId: string;
    youtubeVideoId: string;
    videoTitle: string;
    thumbnailUrl: string;
  };
  export const getSearchResults = (
    query: string,
  ): ResultAsync<TypesenseMoment[], TypesenseError> => {
    const results = useTypesense((ts) => {
      return ts.collections("ei").documents().search({
        q: query,
        query_by: "content",
        highlight_full_fields: "content",
        per_page: 30,
      }) as Promise<SearchResponse<TypesenseMoment>>;
    }).map((res) => {
      if (res.found === 0) {
        return [];
      }
      return res.hits!.map(
        (hit) =>
          ({
            id: hit.document.id,
            content: hit?.highlight?.content?.value || hit.document.content,
            start: hit.document.start,
            videoId: hit.document.videoId,
            youtubeVideoId: hit.document.youtubeVideoId,
            thumbnailUrl: hit.document.thumbnailUrl,
            videoTitle: hit.document.videoTitle,
          }) satisfies TypesenseMoment,
      );
    });

    return results;
  };
}
