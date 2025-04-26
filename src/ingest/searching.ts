import { Client } from "typesense";

export const createIndexIfNotExist = async (id: string, typesense: Client) => {
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
};
