import { getWordsFromVideoId } from "./scrape";

export function base64Encode(str: string) {
  return Buffer.from(str, "utf-8").toString("base64");
}

export function collapseWords(
  words: Awaited<ReturnType<typeof getWordsFromVideoId>>,
  factor: number
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
