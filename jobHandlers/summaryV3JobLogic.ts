import { SummaryMode } from "@prisma/client";

// import { openAiSummarizeEachFileOverall } from "@/jobHandlers/helpers/summaryV3Job/variations/openAi/eachFileOverall";
// import { openAiSummarizeEachFileInChunks } from "@/jobHandlers/helpers/summaryV3Job/variations/openAi/eachFileInChunks";
// import { openAiSummarizeFilesOverall } from "@/jobHandlers/helpers/summaryV3Job/variations/openAi/overall";
// import { openAiSummarizeEachFilePerPage } from "@/jobHandlers/helpers/summaryV3Job/variations/openAi/eachFilePerPage";
import { openAiSummarizeFileOverall } from "@/jobHandlers/helpers/summaryV3Job/variations/openAi/fileOverall";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { SupportedReplicateModels } from "@/types/SupportedReplicateModels";
// import { replicateSummarizeEachFileInChunks } from "./helpers/summaryV3Job/variations/replicate/eachFileInChunks";
// import { replicateSummarizeEachFileOverall } from "./helpers/summaryV3Job/variations/replicate/eachFileOverall";
// import { replicateSummarizeFilesOverall } from "./helpers/summaryV3Job/variations/replicate/overall";
// import { replicateSummarizeEachFilePerPage } from "./helpers/summaryV3Job/variations/replicate/eachFilePerPage";
import { SummaryV3OpenAiCustomizations } from "@/types/SummaryV3OpenAiCustomizations";
import { SummaryV3ReplicateCustomizations } from "@/types/SummaryV3ReplicateCustomizations";

import { SummaryV3Params } from "@/types/SummaryV3Params";

export async function summaryV3JobLogic(
  params: SummaryV3Params,
  job: any,
  done: (err?: Error | null, result?: any) => void
) {
  try {
    console.log("processing JOB with params...", params);
    const { file, bucket, email, customizations, locale, batchId } = params;
    console.log(bucket, file, email, customizations, locale, batchId);
    if (!bucket || !file || !email || !customizations || !locale || !batchId) {
      done(new Error("Invalid Data"));
      return;
    }

    // prettier-ignore
    const { mode, format, length, language, model } = customizations;
    const summarizationType = mode;

    if (["gpt-3.5-turbo", "gpt-3.5-turbo-16k", "gpt-4"].includes(model)) {
      const openAiModel: SupportedOpenAiModels = model as SupportedOpenAiModels;

      switch (summarizationType) {
        // case SummaryMode.EACH_FILE_IN_CHUNKS:
        //   openAiSummarizeEachFileInChunks(
        //     {
        //       format,
        //       length,
        //       language,
        //       model: openAiModel,
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
        // case SummaryMode.EACH_FILE_OVERALL:
        //   openAiSummarizeEachFileOverall(
        //     {
        //       format,
        //       length,
        //       language,
        //       model: openAiModel,
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
        case SummaryMode.FILE_OVERALL:
          openAiSummarizeFileOverall(
            {
              format,
              length,
              language,
              model: openAiModel,
              mode,
            },
            email,
            file,
            bucket,
            job,
            batchId,
            locale,
            done
          );
          break;
        // case SummaryMode.OVERALL:
        //   openAiSummarizeFilesOverall(
        //     {
        //       format,
        //       length,
        //       language,
        //       model: openAiModel,
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
        // case SummaryMode.EACH_FILE_PER_PAGE:
        //   openAiSummarizeEachFilePerPage(
        //     {
        //       format,
        //       length,
        //       language,
        //       model: openAiModel,
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
          console.log("WHY?");
          throw new Error("TODO");
      }
    } else if (
      [
        "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
      ].includes(model)
    ) {
      const replicateModel: SupportedReplicateModels =
        model as SupportedReplicateModels;

      console.log(
        "process.env.REPLICATE_API_TOKEN!",
        process.env.REPLICATE_API_TOKEN!
      );

      switch (summarizationType) {
        // case SummaryMode.EACH_FILE_IN_CHUNKS:
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
        // case SummaryMode.EACH_FILE_OVERALL:
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
        // case SummaryMode.OVERALL:
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
        // case SummaryMode.EACH_FILE_PER_PAGE:
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
          throw new Error("TODO");
      }
    } else {
      throw new Error("Unsupported Model");
    }
  } catch (e: any) {
    done(new Error(e ? e.message : "Something went wrong"));
  }
}
