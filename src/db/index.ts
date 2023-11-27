import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";
import mysql from "mysql2/promise";
import { config } from "../env";

const client = mysql.createPool({
  uri: config.DATABASE_URL,
});

export const db = drizzle(client, { schema, logger: false });
