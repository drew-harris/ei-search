import { youtube_v3 } from "@googleapis/youtube";
import { getReqBody } from "./ctrlDoNotTouch";
import { ResultAsync, fromPromise } from "neverthrow";
import { YouTubeError } from ".";

export function base64Encode(str: string) {
  return Buffer.from(str, "utf-8").toString("base64");
}

export const getVideosFromYoutube = (
  playlistId: string,
): ResultAsync<youtube_v3.Schema$PlaylistItem[], YouTubeError> => {
  return fromPromise(
    (async () => {
      // Get the playlist id
      if (!playlistId) {
        throw new Error("Could not get playlist id from url");
      }

      const items: Awaited<ReturnType<typeof getItemsForPlaylist>>["items"] =
        [];
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

      return items;
    })(),
    (e) => new YouTubeError("Failed to get videos from YouTube", { cause: e }),
  );
};

const getItemsForPlaylist = async (
  playlistId: string,
  nextPageToken?: string,
) => {
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
    },
  );

  if (!response.ok) {
    throw new Error("Got bad response from youtube api");
  }

  const data =
    (await response.json()) as youtube_v3.Schema$PlaylistItemListResponse;

  return {
    items: data.items,
    nextPageToken: data.nextPageToken,
    itemTotal: data.pageInfo?.totalResults,
  };
};

export const getWordsFromVideoId = (
  id: string,
): ResultAsync<Array<{ words: string; start: number }>, YouTubeError> => {
  return fromPromise(
    (async () => {
      const reqBodyToEncode = getReqBody(id);

      const response = await fetch(
        "https://www.youtube.com/youtubei/v1/get_transcript?prettyPrint=false",
        {
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            context: {
              client: { clientName: "WEB", clientVersion: "2.9999099" },
            },
            params: encodeURIComponent(base64Encode(reqBodyToEncode)),
          }),
        },
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as any;

      const cues: any[] =
        data?.actions[0].updateEngagementPanelAction.content.transcriptRenderer
          .content.transcriptSearchPanelRenderer.body
          .transcriptSegmentListRenderer.initialSegments;

      const words = cues.map((cue) => {
        const interm = cue.transcriptSegmentRenderer;
        if (!interm) {
          throw new Error("No transcriptSegmentRenderer");
        }
        if (!interm?.snippet?.runs[0]) {
          throw new Error("No text");
        }
        return {
          words: interm.snippet.runs[0].text as string,
          start: interm.startMs as number,
        };
      });

      if (!words || words.length === 0) {
        throw new Error("No words found");
      }

      //
      return words.filter((w) => w.words != "[Music]");
    })(),
    (e) => new YouTubeError("Failed to get words from video", { cause: e }),
  );
};

export function collapseWords(
  words: Array<{ words: string; start: number }>,
  factor: number,
) {
  const res: typeof words = [];
  for (let i = 0; i < words.length; i += factor) {
    const start = words[i].start;
    const text = words
      .slice(i, i + factor)
      .map((w) => w.words)
      .join(" ");
    res.push({ start, words: text });
  }
  return res;
}
