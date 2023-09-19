import { p } from "@/utils/p";
import { sleep } from "@/utils/sleep";
import { generateOpenAiUserChatCompletion } from "./generateOpenAiUserChatCompletion";
import { Tiktoken, encoding_for_model } from "@dqbd/tiktoken";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";

export async function generateOpenAiUserChatCompletionWithExponentialBackoff(
  model: SupportedOpenAiModels,
  prompt: string,
  delay: number
) {
  console.log("model", model);
  console.log("prompt.length", prompt.length);
  const encoder: Tiktoken = encoding_for_model(
    model === "gpt-3.5-turbo-16k" ? "gpt-3.5-turbo" : model
  );
  const promptTokenCount = encoder.encode(prompt).length;
  console.log("promptTokenCount", promptTokenCount);

  let completion;
  try {
    // prettier-ignore
    completion = await generateOpenAiUserChatCompletion(model, prompt);
  } catch (e) {
    p("retry");
    await sleep(delay * 2);
    try {
      // prettier-ignore
      completion = await generateOpenAiUserChatCompletion(model, prompt);
    } catch (e) {
      p("retry");
      await sleep(delay * 4);
      try {
        // prettier-ignore
        completion = await generateOpenAiUserChatCompletion(model, prompt);
      } catch (e) {
        p("retry");
        await sleep(delay * 8);
        completion = await generateOpenAiUserChatCompletion(model, prompt);
      }
    }
  }

  return completion;
}
