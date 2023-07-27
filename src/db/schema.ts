import { InferModel } from "drizzle-orm";
import { int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

export const podcast = mysqlTable("podcasts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", {
    length: 255,
  }).notNull(),
});

export type Podcast = InferModel<typeof podcast>;

export const episode = mysqlTable("episodes", {
  id: varchar("id", { length: 255 }).unique().notNull().primaryKey(),
  title: varchar("title", {
    length: 255,
  }).notNull(),
  thumbnail: varchar("thumbnail", {
    length: 255,
  }),
  podcastId: int("podcast_id")
    .notNull()
    .references(() => podcast.id, {
      onDelete: "cascade",
    }),
});

export type Episode = InferModel<typeof episode>;

export const moment = mysqlTable("moments", {
  id: int("id").autoincrement().primaryKey(),
  content: text("content").notNull(),
  timestamp: int("timestamp").notNull(),
  episodeId: varchar("episode_id", { length: 255 })
    .notNull()
    .references(() => episode.id, {
      onDelete: "cascade",
    }),
  podcastId: int("podcast_id")
    .notNull()
    .references(() => podcast.id, {
      onDelete: "cascade",
    }),
});

export type Moment = InferModel<typeof moment>;
