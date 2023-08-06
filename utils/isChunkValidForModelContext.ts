import { Tiktoken } from "@dqbd/tiktoken";

export function isChunkValidForModelContext(
  part: string,
  modelContextLimit: number,
  encoder: Tiktoken
): boolean {
  if (encoder.encode(part).length > modelContextLimit) return false;
  return true;
}
