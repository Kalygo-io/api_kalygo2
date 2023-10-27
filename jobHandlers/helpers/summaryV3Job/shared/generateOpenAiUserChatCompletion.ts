import { OpenAI } from "@/clients/openai_client";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { OpenAIApi } from "openai";

export async function generateOpenAiUserChatCompletion(
  model: SupportedOpenAiModels,
  prompt: string,
  openAiClient: OpenAIApi = OpenAI
) {
  const completion = await openAiClient.createChatCompletion({
    model,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0,
  });

  return completion;
}
