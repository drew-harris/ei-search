import { TypesenseMoment } from "./db/algolia";

export const getResults = async (
  query: string,
  distinctId = "default",
): Promise<TypesenseMoment[]> => {
  // const flag = await posthog.getFeatureFlag("use-algolia", distinctId);
  const response = await fetch("https://captioncrawler.com/ei/search", {
    method: "POST",
    body: JSON.stringify({
      query,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch search results");
  }

  return (await response.json()) as TypesenseMoment[];
};
