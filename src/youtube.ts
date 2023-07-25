import { youtube_v3 } from "@googleapis/youtube";

export async function getVideosFromPlaylist(url: string) {
  // Get the playlist id
  const playlistUrl = new URLSearchParams(url.split("?")[1]);
  const playlistId = playlistUrl.get("list");
  if (!playlistId) {
    throw new Error("Could not get playlist id from url");
  }

  const items: Awaited<ReturnType<typeof getItemsForPlaylist>>["items"] = [];
  // Get first batch
  const res = await getItemsForPlaylist(playlistId);
  items.push(...(res.items || []));

  // Get the rest
  let nextPageToken = res.nextPageToken;
  while (nextPageToken) {
    const res = await getItemsForPlaylist(playlistId, nextPageToken);
    items.push(...(res.items || []));
    nextPageToken = res.nextPageToken;
  }

  console.log(items.length + " items" + " " + res.itemTotal);
  return items;
}

async function getItemsForPlaylist(playlistId: string, nextPageToken?: string) {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error("No youtube api key");
  }

  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    key: process.env.YOUTUBE_API_KEY,
    maxResults: "50",
    playlistId,
  });

  if (nextPageToken) {
    params.append("pageToken", nextPageToken);
  }

  const response = await fetch(
    "https://youtube.googleapis.com/youtube/v3/playlistItems?" +
      params.toString(),
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    console.log(await response.text());
    throw new Error("Got bad response from youtube api");
  }

  const data =
    (await response.json()) as youtube_v3.Schema$PlaylistListResponse;

  return {
    items: data.items,
    nextPageToken: data.nextPageToken,
    itemTotal: data.pageInfo?.totalResults,
  };
}
