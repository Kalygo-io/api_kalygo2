import { replicateClient } from "@/clients/replicate_client";
import { SupportedReplicateModels } from "@/types/SupportedReplicateModels";

export async function generateReplicateChatCompletion(
  model: SupportedReplicateModels,
  prompt: string
) {
  const completion = await replicateClient.run(model, {
    input: {
      prompt,
      max_new_tokens: 4096,
    },
  });

  return completion;
}
