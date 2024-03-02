import Elysia from "elysia";

export const tracing = new Elysia().trace(async ({ handle, context }) => {
  const { time, end } = await handle;

  console.log(`${context.path}:`, (await end) - time);
});
