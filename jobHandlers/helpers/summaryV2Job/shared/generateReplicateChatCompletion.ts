import { replicateClient } from "@/clients/replicate_client";
import { SupportedReplicateModels } from "@/types/SupportedReplicateModels";

export async function generateReplicateChatCompletion(
  model: SupportedReplicateModels,
  prompt: string
) {
  const completion = await replicateClient.run(model, {
    input: {
      prompt: "Who is Donald Trump?",
    },
  });

  return completion;
}
