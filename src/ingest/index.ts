import { Client as TSClient } from "typesense";
import { env } from "./env";
import Elysia from "elysia";
import { doEiIngest } from "./handlePlaylistIngest";
import { ResultAsync, fromPromise } from "neverthrow";

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

export class TypesenseError extends Error {
  public errType = "typesense" as const;
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
  }
}

export class YouTubeError extends Error {
  public errType = "youtube" as const;
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
  }
}

export class VideoProcessingError extends Error {
  public errType = "video_processing" as const;
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
  }
}

export class DatabaseError extends Error {
  public errType = "database" as const;
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
  }
}

export type IngestError = TypesenseError | YouTubeError | VideoProcessingError | DatabaseError;

export const useTypesense = <T>(
  fn: (ts: TSClient) => Promise<T>,
): ResultAsync<T, TypesenseError> => {
  const result = fromPromise(
    fn(typesense),
    (e) => new TypesenseError("Typesense Error", { cause: e }),
  );
  return result;
};

export const ingestRoute = new Elysia().post("/ingest", async (c) => {
  const result = await doEiIngest();
  return result.match(
    (message) => ({ success: true, message }),
    (error) => ({ success: false, error: error.message })
  );
});
