import prisma from "@/db/prisma_client";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { p } from "@/utils/p";
import { ScanningMode } from "@prisma/client";

export async function saveToDb(
  account: any,
  completionsForFile: {
    file: string;
    completions: { chunk: number; completion: string }[];
  },
  model: SupportedOpenAiModels,
  prompt: string,
  batchId: string,
  file: any
) {
  p("saving the LLM output and reference to input file in the db...");

  const customRequestV2Record = await prisma.customRequestV2.create({
    data: {
      requesterId: account!.id,
      completionResponse: completionsForFile,
      model: model,
      scanMode: ScanningMode.FILE_IN_CHUNKS,
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

  await prisma.file.create({
    data: {
      customRequestV2Id: customRequestV2Record.id,
      originalName: file.originalname,
      bucket: file.bucket,
      key: file.key,
      hash: file.etag,
      ownerId: account?.id,
    },
  });

  return { customRequestV2Record };
}
