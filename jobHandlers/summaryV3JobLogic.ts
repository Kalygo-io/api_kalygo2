import { ScanningMode } from "@prisma/client";

// import { openAiSummarizeEachFileOverall } from "@/jobHandlers/helpers/summaryV3Job/variations/openAi/eachFileOverall";
// import { openAiSummarizeEachFileInChunks } from "@/jobHandlers/helpers/summaryV3Job/variations/openAi/eachFileInChunks";
// import { openAiSummarizeFilesOverall } from "@/jobHandlers/helpers/summaryV3Job/variations/openAi/overall";
// import { openAiSummarizeEachFilePerPage } from "@/jobHandlers/helpers/summaryV3Job/variations/openAi/eachFilePerPage";
import { openAiSummarizeFileInChunks } from "@/jobHandlers/helpers/summaryV3Job/variations/openAi/fileInChunks";
import { openAiSummarizeFileOverall } from "@/jobHandlers/helpers/summaryV3Job/variations/openAi/fileOverall";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { SupportedReplicateModels } from "@/types/SupportedReplicateModels";
// import { replicateSummarizeEachFileInChunks } from "./helpers/summaryV3Job/variations/replicate/eachFileInChunks";
// import { replicateSummarizeEachFileOverall } from "./helpers/summaryV3Job/variations/replicate/eachFileOverall";
// import { replicateSummarizeFilesOverall } from "./helpers/summaryV3Job/variations/replicate/overall";
// import { replicateSummarizeEachFilePerPage } from "./helpers/summaryV3Job/variations/replicate/eachFilePerPage";
import { SummaryV3OpenAiCustomizations } from "@/types/SummaryV3OpenAiCustomizations";

import { SummaryV3Params } from "@/types/SummaryV3Params";
import { openAiSummarizeFilesOverall } from "./helpers/summaryV3Job/variations/openAi/overall";
import { openAiSummarizeFilePerPage } from "./helpers/summaryV3Job/variations/openAi/filePerPage";

export async function summaryV3JobLogic(
  params: SummaryV3Params,
  job: any,
  done: (err?: Error | null, result?: any) => void
) {
  try {
    console.log("processing JOB with params...", params);
    const { file, files, email, customizations, locale, batchId } = params;
    // console.log(bucket, file, email, customizations, locale, batchId);
    if (!email || !customizations || !locale || !batchId) {
      done(new Error("Invalid Data"));
      return;
    }

    console.log("-!-!-");

    // prettier-ignore
    const { scanMode, format, length, language, model, chunkTokenOverlap } = customizations;
    const summarizationType = scanMode;

    console.log("-!-!-");

    if (["gpt-3.5-turbo", "gpt-3.5-turbo-16k", "gpt-4"].includes(model)) {
      const openAiModel: SupportedOpenAiModels = model as SupportedOpenAiModels;

      console.log("-!-!-", summarizationType, ScanningMode.FILE_IN_CHUNKS);

      switch (summarizationType) {
        case ScanningMode.FILE_IN_CHUNKS:
          openAiSummarizeFileInChunks(
            {
              format,
              length,
              language,
              model: openAiModel,
              scanMode,
              chunkTokenOverlap,
            } as SummaryV3OpenAiCustomizations,
            email,
            file!,
            job,
            batchId,
            locale,
            done
          );
          break;
        case ScanningMode.FILE_OVERALL:
          openAiSummarizeFileOverall(
            {
              format,
              length,
              language,
              model: openAiModel,
              scanMode,
              chunkTokenOverlap,
            } as SummaryV3OpenAiCustomizations,
            email,
            file!,
            job,
            batchId,
            locale,
            done
          );
          break;
        case ScanningMode.OVERALL:
          openAiSummarizeFilesOverall(
            {
              format,
              length,
              language,
              model: openAiModel,
              scanMode,
              chunkTokenOverlap,
            } as SummaryV3OpenAiCustomizations,
            email,
            files!,
            job,
            batchId,
            locale,
            done
          );
          break;
        case ScanningMode.FILE_PER_PAGE:
          openAiSummarizeFilePerPage(
            {
              format,
              length,
              language,
              model: openAiModel,
              scanMode,
            } as SummaryV3OpenAiCustomizations,
            email,
            file,
            job,
            batchId,
            locale,
            done
          );
          break;
        default:
          throw new Error("Unsupported Data Scanning Mode");
      }
    } else if (
      [
        "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
      ].includes(model)
    ) {
      const replicateModel: SupportedReplicateModels =
        model as SupportedReplicateModels;

      switch (summarizationType) {
        // case ScanningMode.EACH_FILE_IN_CHUNKS:
        //   replicateSummarizeEachFileInChunks(
        //     {
        //       format,
        //       length,
        //       language,
        //       model: replicateModel,
        //       mode,
        //     },
        //     email,
        //     files,
        //     bucket,
        //     job,
        //     locale,
        //     done
        //   );
        //   break;
        // case ScanningMode.EACH_FILE_OVERALL:
        //   replicateSummarizeEachFileOverall(
        //     {
        //       format,
        //       length,
        //       language,
        //       model: replicateModel,
        //       mode,
        //     },
        //     email,
        //     files,
        //     bucket,
        //     job,
        //     locale,
        //     done
        //   );
        //   break;
        // case ScanningMode.OVERALL:
        //   replicateSummarizeFilesOverall(
        //     {
        //       format,
        //       length,
        //       language,
        //       model: replicateModel,
        //       mode,
        //     },
        //     email,
        //     files,
        //     bucket,
        //     job,
        //     locale,
        //     done
        //   );
        //   break;
        // case ScanningMode.EACH_FILE_PER_PAGE:
        //   replicateSummarizeEachFilePerPage(
        //     {
        //       format,
        //       length,
        //       language,
        //       model: replicateModel,
        //       mode,
        //     },
        //     email,
        //     files,
        //     bucket,
        //     job,
        //     locale,
        //     done
        //   );
        //   break;
        default:
          throw new Error("TODO add support for Replicate API in Summary V3");
      }
    } else {
      throw new Error("Unsupported Model");
    }
  } catch (e: any) {
    done(new Error(e ? e.message : "Something went wrong"));
  }
}
