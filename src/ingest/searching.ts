import { Client } from "typesense";
import { ResultAsync, fromPromise } from "neverthrow";
import { TypesenseError } from ".";

export const createIndexIfNotExist = (
  id: string,
  typesense: Client,
): ResultAsync<any, TypesenseError> => {
  return fromPromise(
    (async () => {
      try {
        return await typesense.collections(id).retrieve();
      } catch (e) {
        return await typesense.collections().create({
          name: id,
          fields: [
            { name: "content", type: "string", index: true },
            { name: "start", type: "int32", index: true },
          ],
        });
      }
    })(),
    (e) =>
      new TypesenseError({
        message: "Failed to create or retrieve index",
        cause: e,
      }),
  );
};
