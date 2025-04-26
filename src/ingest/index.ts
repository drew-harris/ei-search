import { Client as TSClient } from "typesense";
import { env } from "./env";
import Elysia from "elysia";
import { doEiIngest } from "./handlePlaylistIngest";

export const typesense = new TSClient({
  nodes: [
    {
      host: env.TYPESENSE_HOST,
      port: 8108,
      protocol: "http",
    },
  ],
  apiKey: env.TYPESENSE_API_KEY,
});

export const ingestRoute = new Elysia().post("/ingest", async (c) => {
  doEiIngest();
});
