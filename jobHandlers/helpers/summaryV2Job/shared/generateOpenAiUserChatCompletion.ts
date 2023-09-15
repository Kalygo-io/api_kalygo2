import { OpenAI } from "@/clients/openai_client";
import { SupportedModels } from "@/types/SummaryV2Customizations";

export async function generateOpenAiUserChatCompletion(
  model: SupportedModels,
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
