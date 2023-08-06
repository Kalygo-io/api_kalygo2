import { Tiktoken } from "@dqbd/tiktoken";

export function makeChunksSmaller(
  chunks: string[],
  promptPrefix: string,
  context: number,
  encoder: Tiktoken
): string[] {
  let newChunks = [];
  for (let i = 0; i < chunks.length; i++) {
    const promptWithDataChunk = `${promptPrefix} ${chunks[i]}`;
    if (encoder.encode(promptWithDataChunk).length > context) {
      let middle = Math.floor(chunks[i].length / 2); // TODO - is there a more finesse way to split the chunk then simply in half?
      let before = middle;
      let after = middle + 1;
      if (middle - before < after - middle) {
        middle = before;
      } else middle = after;
      const s1 = chunks[i].substring(0, middle);
      const s2 = chunks[i].substring(middle + 1);
      newChunks.push(s1, s2);
    } else newChunks.push(chunks[i]);
  }

  return newChunks;
}