import prisma from "@/db/prisma_client";
import { SupportedAnthropicModels } from "@/types/SupportedAnthropicModels";
import { p } from "@/utils/p";
import { ScanningMode } from "@prisma/client";

export async function saveToDb(
  account: any,
  finalOverallPromptOutputs: {
    part: number;
    overallCompletion: string;
  }[],
  model: SupportedAnthropicModels,
  prompt: string,
  overallPrompt: string | null,
  batchId: string,
  files: (Express.Multer.File & { bucket: string; key: string; etag: string })[]
) {
  p("saving the LLM output and reference to input file in the db...");

  const customRequestV3Record = await prisma.customRequestV3.create({
    data: {
      requesterId: account!.id,
      completionResponse: finalOverallPromptOutputs,
      model: model,
      scanMode: ScanningMode.OVERALL,
      batchId: batchId,
      prompt: prompt,
    },
  });

  await prisma.prompt.create({
    data: {
      ownerId: account!.id,
      prompt: prompt,
    },
  });

  if (overallPrompt) {
    await prisma.prompt.create({
      data: {
        ownerId: account!.id,
        prompt: overallPrompt,
      },
    });
  }

  // -v-v- STORE FILES FOR REFERENCE -v-v-
  for (let i = 0; i < files.length; i++) {
    await prisma.file.create({
      data: {
        customRequestV3Id: customRequestV3Record.id,
        originalName: files[i].originalname,
        bucket: files[i].bucket,
        key: files[i].key,
        hash: files[i].etag,
        ownerId: account?.id,
      },
    });
  }

  return { customRequestV3Record };
}
