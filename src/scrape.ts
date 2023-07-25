import { eq } from "drizzle-orm";
import { db } from "./db";
import { episode, moment, podcast } from "./db/schema";
import { collapseWords } from "./utils";
import { getVideosFromPlaylist, getWordsFromVideoId } from "./youtube";

await db.delete(episode);
await db.delete(moment);

const ei = await db.query.podcast.findFirst({
  where: eq(podcast.title, "Emergency Intercom"),
});
if (!ei) {
  console.log("No podcast found");
  process.exit(1);
}

console.log(ei);
const videos = await getVideosFromPlaylist(
  "https://www.youtube.com/watch?v=GqShvscnBBs&list=PLy4hOlwN9C5FfB8djRUNS9VSrKvZIVwMC"
);

for (const video of videos) {
  const title = video.snippet?.title?.split(" - ").at(1);
  const vidId = video.contentDetails?.videoId;

  if (!title || !video.id || !vidId) {
    console.log("NOT FOUND STUFF");
    continue;
  }

  try {
    let words = await getWordsFromVideoId(vidId);
    words = collapseWords(words, 5);

    const moments = words.map((w) => ({
      podcastId: ei.id,
      content: w.words,
      episodeId: vidId,
      timestamp: w.start / 1000,
    }));
    await db.insert(episode).values({
      id: vidId,
      title: title,
      podcastId: ei.id,
      thumbnail: video.snippet?.thumbnails?.medium?.url,
    });
    await db.insert(moment).values([...moments]);
  } catch (error) {
    console.error(error);
    continue;
  }
}

process.exit(1);
