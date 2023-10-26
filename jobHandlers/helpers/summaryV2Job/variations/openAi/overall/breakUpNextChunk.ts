import { p } from "@/utils/p";

export function breakUpNextChunk(chunks: string[]): string[] {
  // prettier-ignore
  p("breaking up next chunk of file as it is too large for model context..."); // for console debugging...
  const dataChunk = chunks[0];
  let middle = Math.floor(dataChunk.length / 2);
  let before = middle;
  let after = middle + 1;
  if (middle - before < after - middle) {
    middle = before;
  } else middle = after;
  const s1 = dataChunk.substring(0, middle);
  const s2 = dataChunk.substring(middle + 1);
  chunks.shift();
  chunks.unshift(s1, s2);
  return chunks;
}
