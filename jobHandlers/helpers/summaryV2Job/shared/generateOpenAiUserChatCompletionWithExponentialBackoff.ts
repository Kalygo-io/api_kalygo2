import { OpenAI } from "@/clients/openai_client";
import { p } from "@/utils/p";
import { sleep } from "@/utils/sleep";
import { generateOpenAiUserChatCompletion } from "./generateOpenAiUserChatCompletion";

export async function generateOpenAiUserChatCompletionWithExponentialBackoff(
  model: "gpt-3.5-turbo" | "gpt-4" = "gpt-3.5-turbo",
  prompt: string,
  delay: number
) {
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
      // prettier-ignore
      completion = await generateOpenAiUserChatCompletion(model, prompt);
    }
  }

  return completion;
}
