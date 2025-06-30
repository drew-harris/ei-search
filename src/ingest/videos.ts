import { useTypesense, VideoProcessingError, IngestError } from ".";
import { collapseWords, getWordsFromVideoId } from "./captions";
import { z } from "zod";
import { youtube_v3 } from "@googleapis/youtube";
import { videoTable } from "../db/schema";
import { nanoid } from "nanoid/non-secure";
import { TypesenseMoment } from "../db/algolia";
import { ResultAsync, fromPromise } from "neverthrow";

export interface HandleVideoInput {
  id: string;
  collectionId: string;
  youtubeData: youtube_v3.Schema$PlaylistItem;
}

type VideoInsert = typeof videoTable.$inferInsert;

const videoSchema = z.object({
  id: z.string(),
  collectionId: z.string(),
  youtubeId: z.string(),
  thumbnailUrl: z.string(),
  title: z.string(),
}) satisfies z.ZodType<VideoInsert>;

export const getVideoInsert = (
  video: HandleVideoInput,
): ResultAsync<VideoInsert, VideoProcessingError> => {
  return fromPromise(
    (async () => {
      const toParse = {
        collectionId: video.collectionId,
        id: video.id,
        thumbnailUrl: video.youtubeData.snippet?.thumbnails?.medium?.url,
        title: video.youtubeData.snippet?.title,
        youtubeId: video.youtubeData.contentDetails?.videoId,
      };

      const parsed = videoSchema.safeParse(toParse);
      if (!parsed.success) {
        throw new Error("Could not parse video", { cause: parsed.error });
      } else {
        return parsed.data;
      }
    })(),
    (e) => new VideoProcessingError("Failed to parse video data", { cause: e }),
  );
};

export const addVideoToTypesense = (
  videoInsert: VideoInsert,
): ResultAsync<void, IngestError> => {
  return getWordsFromVideoId(videoInsert.youtubeId).andThen((words) => {
    const collapsedWords = collapseWords(words, 4);

    return useTypesense((ts) => {
      return ts
        .collections("ei")
        .documents()
        .import(
          collapsedWords.map(
            (words) =>
              ({
                id: nanoid(),
                content: words.words,
                start: Math.round(Math.round(words.start) / 1000),
                videoId: videoInsert.id,
                youtubeVideoId: videoInsert.youtubeId,
                thumbnailUrl: videoInsert.thumbnailUrl,
                videoTitle: videoInsert.title,
              }) satisfies TypesenseMoment,
          ),
        );
    }).map(() => void 0);
  });
};

export const handleVideo = (
  video: HandleVideoInput,
): ResultAsync<VideoInsert, IngestError> => {
  return getVideoInsert(video).andThen((insert) => {
    return addVideoToTypesense(insert).map(() => insert);
  });
};
