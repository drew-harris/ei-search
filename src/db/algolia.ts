import algoliasearch from "algoliasearch";
import { config } from "../env";

export const algolia = algoliasearch(
  config.ALGOLIA_APP_ID,
  config.ALGOLIA_ADMIN_KEY,
  {
    timeouts: {
      connect: 999,
      read: 999,
      write: 999,
    },
  }
);

export const momentsIndex = algolia.initIndex("moments");

export const analytics = algolia.initAnalytics();

export interface AlgoliaMoment {
  objectID?: string;
  thumbnail: string | null;
  episodeTitle: string;
  episodeId: string;
  content: string;
  timestamp: number;
  position?: number;
  aid?: string;
}
