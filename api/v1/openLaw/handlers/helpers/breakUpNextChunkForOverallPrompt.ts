import { p } from "@/utils/p";

export function breakUpNextChunkForOverallPrompt(
  chunksRound2: string[],
  processedChunksOfFile: { chunk: number; chunkCompletion: string }[]
): string[] {
  p(
    "breaking up the concatenated summaries as it is too large for model context..."
  ); // for console debugging...
  let middle = Math.floor(processedChunksOfFile.length / 2);
  let before = middle;
  let after = middle + 1;

  if (middle - before < after - middle) {
    middle = before;
  } else middle = after;

  const s1 = processedChunksOfFile
    .slice(0, middle)
    .map((i, idx) => {
      return `${i.chunkCompletion}`;
    })
    .join("\n\n");
  const s2 = processedChunksOfFile
    .slice(middle + 1)
    .map((i, idx) => {
      return `${i.chunkCompletion}`;
    })
    .join("\n\n");
  chunksRound2.shift();
  chunksRound2.unshift(s1, s2);
  return chunksRound2;
}
