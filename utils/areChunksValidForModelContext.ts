import { Tiktoken } from "@dqbd/tiktoken";

export function areChunksValidForModelContext(
  parts: string[],
  modelContextLimit: number,
  enc: Tiktoken
): boolean {
  console.log("areChunksValidForModelContext?");

  for (let i = 0; i < parts.length; i++) {
    if (enc.encode(parts[i]).length > modelContextLimit) return false;
  }
  return true;
}
