import { AnthropicClient } from "@/clients/anthropic_client";
import { SupportedAnthropicModels } from "@/types/SupportedAnthropicModels";

export async function generateAnthropicUserChatCompletion(
  model: SupportedAnthropicModels,
  prompt: string
) {
  console.log("...generateAnthropicUserChatCompletion...");
  // const completion = await AnthropicClient.complete({
  //   model: model,
  //   prompt: prompt,
  //   stop_sequences: [],
  //   max_tokens_to_sample: 8192,
  // });

  const completion = await AnthropicClient.messages.create({
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
    model: model,
  });

  return completion;
}
