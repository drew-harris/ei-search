import { logger } from "./logs";

export type ProjectErrorArgs<T> = {
  message: string;
  type?: T;
  cause?: Error | unknown;
};

export class ProjectError<T extends string> extends Error {
  public report: boolean = false;
  constructor(args: {
    message: string;
    report?: boolean;
    type?: T;
    cause?: unknown;
  }) {
    super(args.message, { cause: args.cause });
    this.name = "ProjectError";
  }
}

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
