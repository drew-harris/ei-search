import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";
import mysql from "mysql2/promise";

const client = mysql.createPool({
  uri: process.env.DATABASE_URL!,
});

export const db = drizzle(client, { schema, logger: false });
