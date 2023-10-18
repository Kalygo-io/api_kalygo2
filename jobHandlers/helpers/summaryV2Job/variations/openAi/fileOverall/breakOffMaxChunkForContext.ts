import { p } from "@/utils/p";
import { Tiktoken } from "@dqbd/tiktoken";

export function breakOffMaxChunkForContext(
  promptPrefix: string,
  chunks: string[],
  maxContext: number,
  encoder: Tiktoken
): string[] {
  const tokensInPrefixPlusChunk = (prefix: string, chunk: string) =>
    encoder.encode(`${prefix} ${chunk}`).length;

  p("breaking off max chunk of file..."); // for console debugging...

  const dataChunk = chunks[0];
  let endSegmentIndex = dataChunk.length;
  let low = 0;
  while (
    tokensInPrefixPlusChunk(
      promptPrefix,
      dataChunk.substring(0, endSegmentIndex)
    ) !== maxContext
  ) {
    console.log(
      "LENGTH",
      tokensInPrefixPlusChunk(
        promptPrefix,
        dataChunk.substring(0, endSegmentIndex)
      )
    );

    if (
      // prettier-ignore
      tokensInPrefixPlusChunk(promptPrefix, dataChunk.substring(0, endSegmentIndex)) < maxContext
    ) {
      console.log("IF", "endSegmentIndex", endSegmentIndex);
      low = endSegmentIndex;
      endSegmentIndex = Math.floor((endSegmentIndex + dataChunk.length) / 2);
    } else {
      console.log("ELSE IF", "endSegmentIndex", endSegmentIndex);
      endSegmentIndex = Math.floor((low + endSegmentIndex) / 2);
    }
  }

  const s1 = dataChunk.substring(0, endSegmentIndex);
  const s2 = dataChunk.substring(endSegmentIndex);
  chunks.shift();
  chunks.unshift(s1, s2);
  return chunks;
}
