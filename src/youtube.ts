import { youtube_v3 } from "@googleapis/youtube";
import { base64Encode } from "./utils";

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
    (await response.json()) as youtube_v3.Schema$PlaylistItemListResponse;

  return {
    items: data.items,
    nextPageToken: data.nextPageToken,
    itemTotal: data.pageInfo?.totalResults,
  };
}

export async function getWordsFromVideoId(id: string) {
  const start = "\n\v" + id;

  const response = await fetch(
    "https://www.youtube.com/youtubei/v1/get_transcript?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        context: { client: { clientName: "WEB", clientVersion: "2.9999099" } },
        params: base64Encode(start),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = (await response.json()) as any;
  // console.log(data);

  const cues: any[] =
    data?.actions[0]?.updateEngagementPanelAction?.content?.transcriptRenderer
      ?.body.transcriptBodyRenderer.cueGroups;

  if (!cues) {
    throw new Error("Could not get cues");
  }

  const words = cues.map((cue) => {
    const interm = cue.transcriptCueGroupRenderer.cues[0].transcriptCueRenderer;
    return {
      words: interm.cue.simpleText as string,
      start: interm.startOffsetMs as number,
    };
  });

  return words.filter((w) => w.words != "[Music]");
}

export function getVideoIdFromUrl(url: string): string {
  const params = new URLSearchParams(url.split("?")[1]);
  return params.get("v")!;
}
