import { Job } from "bullmq";
import { TB_videos } from "db";
import { eq } from "drizzle-orm";
import { PlaylistIngestJob } from "shared/types";
import { Deps } from ".";

export async function getVideoIdsForCollection(
  job: Job<PlaylistIngestJob>,
  deps: Deps,
): Promise<string[]> {
  // Check database for playlist
  // Get the list of already processed video ids
  const videos = await deps.db
    .select({ youtubeId: TB_videos.youtubeId })
    .from(TB_videos)
    .where(eq(TB_videos.collectionId, job.data.collection.id));

  const videoIds = videos.map((v) => v.youtubeId);

  return videoIds;
}
