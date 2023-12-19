import Elysia from "elysia";
import { sentry } from "./sentry";

export const analytics = new Elysia().derive((ctx) => {
  try {
    const cookieKey =
      "ph_phc_XUCFhANAnyrDWNV0T8zUtWpMM2wKcoFsao7z0Sz0hS4_posthog";

    if (!ctx.cookie[cookieKey]) {
      return {
        distinct: undefined,
      };
    }
    const header = ctx.cookie[cookieKey];
    if (!header.get().distinct_id) {
      return {
        distinct: undefined,
      };
    }
    return {
      distinct: header.get().distinct_id as string,
    };
  } catch (error) {
    console.error(error);
    sentry.captureException(error);
    return {
      distinct: undefined,
    };
  }
});
