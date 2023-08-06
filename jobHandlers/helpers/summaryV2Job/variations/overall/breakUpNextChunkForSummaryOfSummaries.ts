import { p } from "@/utils/p";

export function breakUpNextChunkForSummaryOfSummaries(
  chunks: string[],
  summariesOfEachFile: { fileName: string; summary: string }[]
): string[] {
  p(
    "breaking up the concatenated summaries as it is too large for model context..."
  ); // for console debugging...
  let middle = Math.floor(summariesOfEachFile.length / 2);
  let before = middle;
  let after = middle + 1;

  if (middle - before < after - middle) {
    middle = before;
  } else middle = after;

  const s1 = summariesOfEachFile
    .slice(0, middle)
    .map((i, idx) => {
      return `Here is the summary of ${i.fileName}: ${i.summary}`;
    })
    .join("\n\n");
  const s2 = summariesOfEachFile
    .slice(middle + 1)
    .map((i, idx) => {
      return `Here is the summary of ${i.fileName}: ${i.summary}`;
    })
    .join("\n\n");
  chunks.shift();
  chunks.unshift(s1, s2);
  return chunks;
}
