import { AlgoliaMoment, momentsIndex } from "./db/algolia";

export const getResults = async (
  query: string,
  distinctId = "default",
): Promise<AlgoliaMoment[]> => {
  // const flag = await posthog.getFeatureFlag("use-algolia", distinctId);
  const results = await momentsIndex.search<AlgoliaMoment>(query, {
    cacheable: true,
    restrictHighlightAndSnippetArrays: true,
    removeStopWords: false,
    analytics: true,
    userToken: distinctId,
    length: 80,
    offset: 0,
  });

  let moments = results.hits;
  const mappedMoments = moments.map((m) => {
    return {
      ...m,
      content: m._highlightResult?.content?.value || m.content,
      aid: results.queryID,
    };
  });

  return mappedMoments;
};
