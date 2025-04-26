import * as schema from "./schema";
import { drizzle } from "drizzle-orm/postgres-js";

import { config } from "../env";
import postgres from "postgres";

const queryClient = postgres(config.DATABASE_URL, {
  onnotice() {},
});

export const db = drizzle(queryClient, { schema, logger: false });
