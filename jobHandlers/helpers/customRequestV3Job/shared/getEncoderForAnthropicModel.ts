import { supportedAnthropicModels } from "@/config/models";
import { SupportedAnthropicModels } from "@/types/SupportedAnthropicModels";
import { encoding_for_model } from "@dqbd/tiktoken";

export function getEncoderForAnthropicModel(model: SupportedAnthropicModels) {
  let encoder;
  if (supportedAnthropicModels.includes(model as SupportedAnthropicModels)) {
    encoder = encoding_for_model("gpt-4o") as any; // TODO: FIX THIS HACK UNTIL ANTHROPIC OFFERS A LIBRARY FOR COUNTING TOKENS CLIENT-SIDE
  } else {
    throw new Error("Unsupported A.I. Model");
  }
  return encoder;
}
