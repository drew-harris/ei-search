import { InferModel } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const feedbackTable = pgTable("feedback", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export type Feedback = InferModel<typeof feedbackTable>;
