import { Tiktoken } from "@dqbd/tiktoken";

export function areChunksWithPromptPrefixValidForModelContext(
  promptPrefix: string,
  chunks: string[],
  modelContextLimit: number,
  enc: Tiktoken
): boolean {
  console.log("areChunksValidForModelContext?");

  for (let i = 0; i < chunks.length; i++) {
    if (enc.encode(`${promptPrefix} ${chunks[i]}`).length > modelContextLimit) {
      return false;
    }
  }

  return true;
}
