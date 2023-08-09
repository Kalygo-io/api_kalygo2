import { OpenAI } from "@/clients/openai_client";
import { p } from "@/utils/p";
import { sleep } from "@/utils/sleep";
import fs from "fs";
import { generateOpenAiUserChatCompletion } from "./generateOpenAiUserChatCompletion";

export async function generateOpenAiUserChatCompletionWithExponentialBackoff(
  model: "gpt-3.5-turbo" | "gpt-4" = "gpt-3.5-turbo",
  prompt: string,
  delay: number,
  debugFilename: string = "test"
) {
  console.log("model", model);
  console.log("prompt.length", prompt.length);

  if (process.env.NODE_ENV !== "production")
    fs.writeFileSync(`${__dirname}/../../../../debug/${debugFilename}`, prompt);

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
