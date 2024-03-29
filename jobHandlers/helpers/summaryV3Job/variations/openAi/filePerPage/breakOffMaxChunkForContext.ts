import { Tiktoken } from "@dqbd/tiktoken";

export function breakOffMaxChunkForContext(
  promptPrefix: string,
  chunks: string[],
  maxContext: number,
  encoder: Tiktoken
): string[] {
  const tokensInPrefixPlusChunk = (prefix: string, chunk: string) =>
    encoder.encode(`${prefix} ${chunk}`).length;
  const dataChunk = chunks[0];
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
  chunks.shift();
  chunks.unshift(s1, s2);
  return chunks;
}
