import prisma from "@/db/prisma_client";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { p } from "@/utils/p";
import { SummaryMode } from "@prisma/client";

export async function saveToDb(
  account: any,
  summaryForFile: string,
  model: SupportedOpenAiModels,
  language: string,
  format: "bullet-points" | "paragraph",
  batchId: string,
  file: any
) {
  p("saving the summary and the reference to the input file to the db...");
  // Save the summary to the DB
  const summaryV3Record = await prisma.summaryV3.create({
    data: {
      requesterId: account!.id,
      summary: summaryForFile,
      mode: SummaryMode.FILE_OVERALL,
      model: model,
      language: language,
      format: format,
      batchId: batchId,
    },
  });
  // Save the file for reference
  await prisma.file.create({
    data: {
      summaryV3Id: summaryV3Record.id,
      originalName: file.originalname,
      bucket: file.bucket,
      key: file.key,
      hash: file.etag,
      ownerId: account?.id,
    },
  });
  return { summaryV3Record };
}
