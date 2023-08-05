import { OpenAI } from "@/clients/openai_client";

export async function generateOpenAiUserChatCompletion(
  model: "gpt-3.5-turbo" | "gpt-4" = "gpt-3.5-turbo",
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
