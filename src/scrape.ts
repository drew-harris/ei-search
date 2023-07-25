import { base64Encode } from "./utils";

async function getWordsFromVideoId(id: string) {
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
    data.actions[0].updateEngagementPanelAction.content.transcriptRenderer.body
      .transcriptBodyRenderer.cueGroups;

  const words = cues.map((cue) => {
    const interm = cue.transcriptCueGroupRenderer.cues[0].transcriptCueRenderer;
    return {
      words: interm.cue.simpleText,
      start: interm.startOffsetMs,
    };
  });

  return words.filter((w) => w.words != "[Music]");
}

function getVideoIdFromUrl(url: string): string {
  const params = new URLSearchParams(url.split("?")[1]);
  return params.get("v")!;
}

// ---------- main ------------

const id = getVideoIdFromUrl(
  "https://www.youtube.com/watch?v=oF_M1f18lng&t=1849s"
);

console.log(await getWordsFromVideoId(id));

// https://www.youtube.com/watch?v=GqShvscnBBs&list=PLy4hOlwN9C5FfB8djRUNS9VSrKvZIVwMC
// https://www.youtube.com/playlist?list=PLy4hOlwN9C5FfB8djRUNS9VSrKvZIVwMC
