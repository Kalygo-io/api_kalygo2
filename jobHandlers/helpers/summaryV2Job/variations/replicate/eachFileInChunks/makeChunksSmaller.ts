export function makeChunksSmaller(
  chunks: string[],
  promptPrefix: string,
  context: number,
  encoder: any
): string[] {
  let newChunks = [];
  for (let i = 0; i < chunks.length; i++) {
    const promptWithDataChunk = `${promptPrefix} ${chunks[i]}`;

    console.log(
      "making Chunks smaller...",
      encoder.encode(promptWithDataChunk).length,
      context
    );

    if (encoder.encode(promptWithDataChunk).length > context) {
      console.log("i", i);
      console.log("BREAKING CHUNK IN HALF");
      console.log(
        "CHUNK TOKEN COUNT IS",
        encoder.encode(promptWithDataChunk).length
      );
      let middle = Math.floor(chunks[i].length / 2); // TODO - is there a more finesse way to split the chunk then simply in half?
      let before = middle;
      let after = middle + 1;
      if (middle - before < after - middle) {
        middle = before;
      } else middle = after;
      const s1 = chunks[i].substring(0, middle);
      const s2 = chunks[i].substring(middle + 1);
      newChunks.push(s1, s2);
    } else {
      console.log("i", i);
      console.log("CHUNK FITS CONTEXT of ", context);
      console.log(
        "CHUNK TOKEN COUNT IS",
        encoder.encode(promptWithDataChunk).length
      );
      newChunks.push(chunks[i]);
    }
  }

  return newChunks;
}
