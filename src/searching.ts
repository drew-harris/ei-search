import { eq, sql } from "drizzle-orm";
import { AlgoliaMoment, momentsIndex } from "./db/algolia";
import { episode, moment } from "./db/schema";
import { posthog } from "./posthog";
import { db } from "./db";

export const getResults = async (
  query: string,
  distinctId = "default",
): Promise<AlgoliaMoment[]> => {
  // const flag = await posthog.getFeatureFlag("use-algolia", distinctId);
  const flag = true;

  if (flag) {
    const results = await momentsIndex.search<AlgoliaMoment>(query, {
      cacheable: true,
      restrictHighlightAndSnippetArrays: true,
      removeStopWords: false,
      analytics: true,
      userToken: distinctId,
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
  } else {
    return await db
      .select({
        thumbnail: episode.thumbnail,
        episodeTitle: episode.title,
        episodeId: episode.id,
        content: moment.content,
        timestamp: moment.timestamp,
      })
      .from(moment)
      .where(sql`MATCH (content) AGAINST (${query} IN NATURAL LANGUAGE MODE)`)
      .limit(50)
      .innerJoin(episode, eq(moment.episodeId, episode.id));
  }
};
