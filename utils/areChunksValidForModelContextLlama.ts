export function areChunksValidForModelContextLlama(
  parts: string[],
  modelContextLimit: number,
  enc: any
): boolean {
  console.log("areChunksValidForModelContext?");

  for (let i = 0; i < parts.length; i++) {
    if (enc.encode(parts[i]).length > modelContextLimit) return false;
  }
  return true;
}
