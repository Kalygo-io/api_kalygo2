import { p } from "@/utils/p";
import { Tiktoken } from "@dqbd/tiktoken";

export function getOverlapSegment(
  chunkTokenOverlap: number,
  chunk: string,
  encoder: Tiktoken
): string {
  console.log("calculating overlapSegment...");
  const tokensInChunk = (chunk: string) => encoder.encode(chunk).length;

  if (tokensInChunk(chunk) < chunkTokenOverlap) {
    // if chunk is smaller than desired overlap segment length return the chunk
    return chunk;
  }

  if (chunkTokenOverlap > 0) {
    let startSegmentIndex = -chunk.length;
    let high = 0;
    while (
      tokensInChunk(chunk.slice(startSegmentIndex)) !== chunkTokenOverlap
    ) {
      if (
        // prettier-ignore
        tokensInChunk(chunk.slice(startSegmentIndex)) < chunkTokenOverlap
      ) {
        console.log("chunk size is smaller than token overlap...");
        console.log(tokensInChunk(chunk.slice(startSegmentIndex)));
        startSegmentIndex = Math.floor((high + startSegmentIndex) / 2);
      } else {
        console.log("chunk size is larger than token overlap...");
        console.log(tokensInChunk(chunk.slice(startSegmentIndex)));
        high = startSegmentIndex;
        startSegmentIndex = Math.floor(startSegmentIndex / 2);
      }
    }
    console.log("returning overlap segment...");
    return chunk.slice(startSegmentIndex);
  } else {
    return ``;
  }
}
