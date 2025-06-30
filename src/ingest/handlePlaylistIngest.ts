import { getVideosFromYoutube } from "./captions";
import { createIndexIfNotExist } from "./searching";
import { HandleVideoInput, handleVideo } from "./videos";
import { logger } from "./logging";
import { typesense, IngestError, DatabaseError } from ".";
import { db } from "../db";
import { videoTable } from "../db/schema";
import { nanoid } from "nanoid";
import { ResultAsync, fromPromise } from "neverthrow";

export const doEiIngest = (): ResultAsync<string, IngestError> => {
  return createIndexIfNotExist("ei", typesense)
    .andThen(() => {
      return getVideosFromYoutube("PLy4hOlwN9C5FfB8djRUNS9VSrKvZIVwMC");
    })
    .andThen((youtubeVideos) => {
      logger.info({ amount: youtubeVideos.length }, "Got videos from youtube");

      const filteredVideos = youtubeVideos.filter((v) => {
        if (v.snippet?.thumbnails?.medium?.url) {
          return true;
        } else {
          return false;
        }
      });

      return fromPromise(
        (async () => {
          const currentIds = await db
            .select({ ytId: videoTable.youtubeId })
            .from(videoTable);

          const currentVideoIds = currentIds.map((v) => v.ytId);

          const videos = filteredVideos.filter(
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

          return videoInputs;
        })(),
        (e) =>
          new DatabaseError("Failed to get current video IDs", { cause: e }),
      );
    })
    .andThen((videoInputs) => {
      return fromPromise(
        (async () => {
          // Process all videos and collect results
          const handleVideoResults = await Promise.all(
            videoInputs.map(async (v) => {
              const result = await handleVideo(v);
              return result.match(
                (insert) => ({ result: "success" as const, insert }),
                (error) => ({ result: "error" as const, error }),
              );
            }),
          );

          const inserts = [];
          for (const result of handleVideoResults) {
            if (result.result === "success") {
              inserts.push(result.insert);
            } else {
              logger.error(result.error, "error adding video");
            }
          }

          const inserted = await db
            .insert(videoTable)
            .values(inserts)
            .returning();

          logger.info({ amount: inserted.length }, "Inserted videos");

          logger.info(
            {
              amount: handleVideoResults.filter((r) => r.result === "error")
                .length,
            },
            "Errors processing videos videos",
          );

          return "Done";
        })(),
        (e) => new DatabaseError("Failed to process videos", { cause: e }),
      );
    });
};
