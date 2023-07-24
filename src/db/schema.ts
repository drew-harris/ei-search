import { InferModel } from "drizzle-orm";
import { bigint, int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

export const podcast = mysqlTable("podcasts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", {
    length: 255,
  }).notNull(),
});

export type Todo = InferModel<typeof podcast>;

export const episode = mysqlTable("episodes", {
  id: int("id").autoincrement().primaryKey(),
  videoId: varchar("video_id", {
    length: 64,
  })
    .notNull()
    .unique(),
  title: varchar("title", {
    length: 255,
  }).notNull(),
  thumbnail: varchar("thumbnail", {
    length: 255,
  }),
  podcastId: int("podcast_id").references(() => podcast.id, {
    onDelete: "cascade",
  }),
});

export type Episode = InferModel<typeof episode>;

export const moment = mysqlTable("moments", {
  id: int("id").autoincrement().primaryKey(),
  content: text("content").notNull(),
  timestamp: bigint("timestamp", {
    mode: "bigint",
  }),
  episodeId: int("episode_id").references(() => episode.id, {
    onDelete: "cascade",
  }),
  podcastId: int("podcast_id").references(() => podcast.id, {
    onDelete: "cascade",
  }),
});

export type Moment = InferModel<typeof moment>;
