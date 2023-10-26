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
  file: Express.Multer.File & { bucket: string; key: string; etag: string }
) {
  p("saving the LLM output and reference to input file in the db...");

  const customRequestV3Record = await prisma.customRequestV3.create({
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
      customRequestV3Id: customRequestV3Record.id,
      originalName: file.originalname,
      bucket: file.bucket,
      key: file.key,
      hash: file.etag,
      ownerId: account?.id,
    },
  });

  return { customRequestV3Record };
}
