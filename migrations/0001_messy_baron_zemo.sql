CREATE TABLE IF NOT EXISTS "video" (
	"id" text PRIMARY KEY NOT NULL,
	"youtube_id" text NOT NULL,
	"title" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	CONSTRAINT "youtube_vid_unq" UNIQUE("youtube_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "youtube_vid_idx" ON "video" ("youtube_id");