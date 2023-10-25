import { Tiktoken } from "@dqbd/tiktoken";
import { getOverlapSegment } from "../../../shared/getOverlapSegment";

export function makeChunksFitContext(
  chunks: string[],
  promptPrefix: string,
  maxContext: number,
  encoder: Tiktoken,
  chunkTokenOverlap: number
): string[] {
  const tokensInPrefixPlusChunk = (prefix: string, chunk: string) =>
    encoder.encode(`${prefix} ${chunk}`).length;
  let newChunks: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const dataChunk = chunks[i];
    let endSegmentIndex = dataChunk.length;
    let low = 0;
    while (
      tokensInPrefixPlusChunk(
        promptPrefix,
        dataChunk.substring(0, endSegmentIndex)
      ) !== maxContext
    ) {
      if (
        // prettier-ignore
        tokensInPrefixPlusChunk(promptPrefix, dataChunk.substring(0, endSegmentIndex)) < maxContext
      ) {
        low = endSegmentIndex;
        endSegmentIndex = Math.floor((endSegmentIndex + dataChunk.length) / 2);
      } else {
        endSegmentIndex = Math.floor((low + endSegmentIndex) / 2);
      }
    }
    const s1 = dataChunk.substring(0, endSegmentIndex);
    const s2 = dataChunk.substring(endSegmentIndex);
    newChunks.splice(i, 1, s1);
    if (s2) {
      const overlapSegment: string = getOverlapSegment(
        chunkTokenOverlap,
        s2,
        encoder
      );

      newChunks.splice(i, 1, s1);
      newChunks.splice(i + 1, 1, `${overlapSegment}${s2}`);
    }
  }
  return newChunks;
}
