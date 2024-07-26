import Elysia from "elysia";
import { logger } from "./logs";

export const tracing = new Elysia().trace(async ({ handle, context }) => {
  const { time, end } = await handle;

  logger.info({ path: context.path, time, end });
});
