import { InferModel } from "drizzle-orm";
import { index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

export const feedbackTable = pgTable("feedback", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const videoTable = pgTable(
  "video",
  {
    id: text("id").primaryKey(),
    youtubeId: text("youtube_id").notNull(),
    title: text("title").notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
  },
  (table) => {
    return {
      youtubeIdx: index("youtube_vid_idx").on(table.youtubeId),
      youtubeUniq: unique("youtube_vid_unq").on(table.youtubeId),
    };
  },
);

export type Feedback = InferModel<typeof feedbackTable>;
export type Video = InferModel<typeof videoTable>;
