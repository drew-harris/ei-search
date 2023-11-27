import { eq } from "drizzle-orm";
import { db } from "../db";
import { algolia, momentsIndex } from "../db/algolia";
import { episode, moment } from "../db/schema";

let moments = await db
  .select()
  .from(moment)
  .innerJoin(episode, eq(moment.episodeId, episode.id))
  .execute();
console.log(moments.length);

let mappedMoments = moments.map((m) => ({
  objectID: m.moments.id,
  thumbnail: m.episodes.thumbnail,
  episodeTitle: m.episodes.title,
  episodeId: m.episodes.id,
  content: m.moments.content,
  timestamp: m.moments.timestamp,
}));

const index = momentsIndex.clearObjects().then(() =>
  momentsIndex.saveObjects(mappedMoments).then((objs) => {
    console.log(objs);
  })
);
