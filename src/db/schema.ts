import { InferModel } from "drizzle-orm";
import { mysqlTable, serial } from "drizzle-orm/mysql-core";

export const todos = mysqlTable("todos", {
  id: serial("id").primaryKey(),
});

export type Todo = InferModel<typeof todos>;
