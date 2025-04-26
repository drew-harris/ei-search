CREATE TABLE IF NOT EXISTS "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"submitted_at" timestamp DEFAULT now()
);
