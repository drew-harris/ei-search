import { getVideosFromYoutube } from "./captions";
import { createIndexIfNotExist } from "./searching";
import { HandleVideoInput, handleVideo } from "./videos";
import { logger } from "./logging";
import { typesense } from ".";
import { db } from "../db";
import { videoTable } from "../db/schema";
import { nanoid } from "nanoid";

export const doEiIngest = async () => {
  // Create an index on typesense if it doesn't exist already
  const searchIndex = await createIndexIfNotExist("ei", typesense);

  let youtubeVideos = await getVideosFromYoutube(
    "PLy4hOlwN9C5FfB8djRUNS9VSrKvZIVwMC",
  );

  logger.info({ amount: youtubeVideos.length }, "Got videos from youtube");

  youtubeVideos = youtubeVideos.filter((v) => {
    if (v.snippet?.thumbnails?.medium?.url) {
      return true;
    } else {
      return false;
    }
  });

  const currentIds = await db
    .select({ ytId: videoTable.youtubeId })
    .from(videoTable);

  const currentVideoIds = currentIds.map((v) => v.ytId);

  const videos = youtubeVideos.filter(
    (v) => !currentVideoIds.includes(v.contentDetails?.videoId || ""),
  );

  const videoInputs = videos.map(
    (v) =>
      ({
        id: nanoid(12),
        youtubeData: v,
        collectionId: "ei",
      }) satisfies HandleVideoInput,
  );

  logger.info({ amount: videoInputs.length }, "Got videos to handle");

  // Add videos to database
  const handleVideoResults = await Promise.all(
    videoInputs.map((v) => handleVideo(v)),
  );

  const inserts = [];
  for (const result of handleVideoResults) {
    if (result.result === "success") {
      inserts.push(result.insert);
    } else {
      logger.error(result.error, "error adding video");
    }
  }

  const inserted = await db.insert(videoTable).values(inserts).returning();

  logger.info({ amount: inserted.length }, "Inserted videos");

  logger.info(
    { amount: handleVideoResults.filter((r) => r.result === "error").length },
    "Errors processing videos videos",
  );

  return "Done";
};
