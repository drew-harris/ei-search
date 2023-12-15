import Elysia from "elysia";
import { sentry } from "./sentry";

export const analytics = new Elysia().derive((ctx) => {
  try {
    const cookieKey =
      "ph_phc_XUCFhANAnyrDWNV0T8zUtWpMM2wKcoFsao7z0Sz0hS4_posthog";
    const header = ctx.cookie[cookieKey];
    return {
      distinct: (header.get().distinct_id as string) || undefined,
    };
  } catch (error) {
    sentry.captureException(error);
    return {
      distinct: undefined,
    };
  }
});
