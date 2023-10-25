import { OpenAI } from "@/clients/openai_client";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";

export async function generateOpenAiUserChatCompletion(
  model: SupportedOpenAiModels,
  prompt: string
) {
  const completion = await OpenAI.createChatCompletion({
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
