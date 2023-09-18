import { OpenAI } from "@/clients/openai_client";
import { p } from "@/utils/p";
import { sleep } from "@/utils/sleep";
import fs from "fs";
import { generateOpenAiUserChatCompletion } from "./generateOpenAiUserChatCompletion";
import { Tiktoken, encoding_for_model } from "@dqbd/tiktoken";
import { SupportedModels } from "@/types/SupportedModels";

export async function generateOpenAiUserChatCompletionWithExponentialBackoff(
  model: SupportedModels = "gpt-3.5-turbo",
  prompt: string,
  delay: number,
  debugFilename: string = "test"
) {
  console.log("model", model);
  console.log("prompt.length", prompt.length);
  const encoder: Tiktoken = encoding_for_model(
    model === "gpt-3.5-turbo-16k" ? "gpt-3.5-turbo" : model
  );
  const promptTokenCount = encoder.encode(prompt).length;
  console.log("promptTokenCount", promptTokenCount);

  // if (process.env.NODE_ENV !== "production")
  //   fs.writeFileSync(
  //     `${__dirname}/../../../../debugQueue/${debugFilename}`,
  //     prompt
  //   );

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
