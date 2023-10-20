import { p } from "@/utils/p";
import { Tiktoken } from "@dqbd/tiktoken";

export function getOverlapSegment(
  chunkTokenOverlap: number,
  chunk: string,
  encoder: Tiktoken
): string {
  const tokensInChunk = (chunk: string) => encoder.encode(chunk).length;
  let startSegmentIndex = -chunk.length;
  let high = 0;
  while (tokensInChunk(chunk.slice(startSegmentIndex)) !== chunkTokenOverlap) {
    if (
      // prettier-ignore
      tokensInChunk(chunk.slice(startSegmentIndex)) < chunkTokenOverlap
    ) {
      startSegmentIndex = Math.floor((high + startSegmentIndex) / 2);
    } else {
      high = startSegmentIndex;
      startSegmentIndex = Math.floor(startSegmentIndex / 2);
    }
  }
  return chunk.slice(startSegmentIndex);
}
