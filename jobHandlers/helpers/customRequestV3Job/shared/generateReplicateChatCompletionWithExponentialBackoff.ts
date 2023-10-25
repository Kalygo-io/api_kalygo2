import { p } from "@/utils/p";
import { sleep } from "@/utils/sleep";
import { generateReplicateChatCompletion } from "./generateReplicateChatCompletion";
import { SupportedReplicateModels } from "@/types/SupportedReplicateModels";

export async function generateReplicateChatCompletionWithExponentialBackoff(
  model: SupportedReplicateModels,
  prompt: string,
  delay: number
) {
  console.log("model", model);
  console.log("prompt.length", prompt.length);

  //   const promptTokenCount = encoder.encode(prompt).length;
  //   console.log("promptTokenCount", promptTokenCount);

  let completion;
  try {
    // prettier-ignore
    completion = await generateReplicateChatCompletion(model, prompt);
  } catch (e) {
    p("retry");
    await sleep(delay * 2);
    try {
      // prettier-ignore
      completion = await generateReplicateChatCompletion(model, prompt);
    } catch (e) {
      p("retry");
      await sleep(delay * 4);
      try {
        // prettier-ignore
        completion = await generateReplicateChatCompletion(model, prompt);
      } catch (e) {
        p("retry");
        await sleep(delay * 8);
        completion = await generateReplicateChatCompletion(model, prompt);
      }
    }
  }

  return completion;
}
