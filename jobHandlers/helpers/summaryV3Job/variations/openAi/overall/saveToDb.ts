import prisma from "@/db/prisma_client";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { p } from "@/utils/p";
import { ScanningMode } from "@prisma/client";

export async function saveToDb(
  account: any,
  summaryOfSummaries: any,
  model: SupportedOpenAiModels,
  language: string,
  format: "bullet-points" | "paragraph",
  batchId: string,
  files: any
) {
  p("saving the summary and the reference to the input file to the db...");
  // Save the summary to the DB
  const summaryV3Record = await prisma.summaryV3.create({
    data: {
      requesterId: account!.id,
      summary: summaryOfSummaries,
      scanMode: ScanningMode.OVERALL,
      model: model,
      language: language,
      format: format,
      batchId: batchId,
    },
  });
  // Save the files for reference
  for (let i = 0; i < files.length; i++) {
    await prisma.file.create({
      data: {
        summaryV3Id: summaryV3Record.id,
        originalName: files[i].originalname,
        bucket: files[i].bucket,
        key: files[i].key,
        hash: files[i].etag,
        ownerId: account?.id,
      },
    });
  }
  return { summaryV3Record };
}
