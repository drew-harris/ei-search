import { collapseWords } from "./utils";
import {
  getVideoIdFromUrl,
  getVideosFromPlaylist,
  getWordsFromVideoId,
} from "./youtube";

const id = getVideoIdFromUrl(
  "https://www.youtube.com/watch?v=oF_M1f18lng&t=1849s"
);

const words = await getWordsFromVideoId(id);

const mapped = collapseWords(words, 10);
console.log(mapped);

const videos = await getVideosFromPlaylist(
  "https://www.youtube.com/watch?v=GqShvscnBBs&list=PLy4hOlwN9C5FfB8djRUNS9VSrKvZIVwMC"
);

for (const videoId in videos) {
}
