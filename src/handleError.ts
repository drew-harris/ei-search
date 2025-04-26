import { logger } from "./logs";

export const sendError = (e: Error | unknown) => {
  logger.error(e);
  if (!(e instanceof Error)) {
    return;
  }
  if (process.env.DISCORD_ERROR_WEBHOOK) {
    fetch(process.env.DISCORD_ERROR_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `**Error:** ${e.message} \n ${e.stack}`,
      }),
    });
  }
};
