import { p } from "@/utils/p";
import { sleep } from "@/utils/sleep";
import { generateOpenAiUserChatCompletion } from "./generateOpenAiUserChatCompletion";
import { Tiktoken, encoding_for_model } from "@dqbd/tiktoken";
import { SupportedAnthropicModels } from "@/types/SupportedAnthropicModels";
import { getEncoderForAnthropicModel } from "./getEncoderForAnthropicModel";
import { generateAnthropicUserChatCompletion } from "./generateAnthropicUserChatCompletion";

export async function generateAnthropicUserChatCompletionWithExponentialBackoff(
  model: SupportedAnthropicModels,
  prompt: string,
  delay: number
) {
  p("call the A.I. model");
  console.log("model", model);
  console.log("prompt.length", prompt.length);

  // const encoder: Tiktoken = encoding_for_model(
  //   model === "gpt-3.5-turbo-16k" ? "gpt-3.5-turbo" : model
  // );

  const encoder = getEncoderForAnthropicModel(model);

  const promptTokenCount = encoder.encode(prompt).length;
  console.log("promptTokenCount", promptTokenCount);

  let completion;
  try {
    // prettier-ignore
    completion = await generateAnthropicUserChatCompletion(model, prompt);
  } catch (e) {
    p("retry");
    await sleep(delay * 2);
    try {
      // prettier-ignore
      completion = await generateAnthropicUserChatCompletion(model, prompt);
    } catch (e) {
      p("retry");
      await sleep(delay * 4);
      try {
        // prettier-ignore
        completion = await generateAnthropicUserChatCompletion(model, prompt);
      } catch (e) {
        p("retry");
        await sleep(delay * 8);
        completion = await generateAnthropicUserChatCompletion(model, prompt);
      }
    }
  }

  return completion;
}
