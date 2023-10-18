import {
  supportedOpenAiModels,
  supportedReplicateModels,
} from "@/config/models";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { SupportedReplicateModels } from "@/types/SupportedReplicateModels";
import llamaTokenizer from "@/utils/llama-tokenizer";
import { encoding_for_model } from "@dqbd/tiktoken";

export function getEncoderForModel(
  model: SupportedOpenAiModels | SupportedReplicateModels
) {
  let encoder;
  if (supportedOpenAiModels.includes(model as SupportedOpenAiModels)) {
    encoder = encoding_for_model(
      (model === "gpt-3.5-turbo-16k" ? "gpt-3.5-turbo" : model) as any
    );
  } else if (
    supportedReplicateModels.includes(model as SupportedReplicateModels)
  ) {
    encoder = llamaTokenizer;
  } else {
    throw new Error("Unsupported A.I. Model");
  }
  return encoder;
}
