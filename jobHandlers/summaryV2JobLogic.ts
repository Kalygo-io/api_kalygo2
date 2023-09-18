import { SummaryMode } from "@prisma/client";

import { openAiSummarizeEachFileOverall } from "@/jobHandlers/helpers/summaryV2Job/variations/openAi/eachFileOverall";
import { openAiSummarizeEachFileInChunks } from "@/jobHandlers/helpers/summaryV2Job/variations/openAi/eachFileInChunks";
import { openAiSummarizeFilesOverall } from "@/jobHandlers/helpers/summaryV2Job/variations/openAi/overall";
import { openAiSummarizeEachFilePerPage } from "@/jobHandlers/helpers/summaryV2Job/variations/openAi/eachFilePerPage";

import { replicateSummarizeEachFileInChunks } from "@/jobHandlers/helpers/summaryV2Job/variations/replicate/eachFileInChunks";

import { SummaryV2OpenAiCustomizations } from "@/types/SummaryV2OpenAiCustomizations";
import { SummaryV2ReplicateCustomizations } from "@/types/SummaryV2ReplicateCustomizations";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { SupportedReplicateModels } from "@/types/SupportedReplicateModels";

export async function summaryV2JobLogic(
  params: {
    bucket: string;
    files: any[];
    email: string;
    customizations:
      | SummaryV2OpenAiCustomizations
      | SummaryV2ReplicateCustomizations;
    language: string;
    locale: string;
  },
  job: any,
  done: (err?: Error | null, result?: any) => void
) {
  try {
    console.log("processing JOB with params...", params);
    const { files, bucket, email, customizations, locale } = params;
    console.log(bucket, files, email, customizations, locale);
    if (!bucket || !files || !email || !customizations || !locale) {
      done(new Error("Invalid Data"));
      return;
    }

    // prettier-ignore
    const { mode, format, length, language, model } = customizations;
    const summarizationType = mode;

    if (["gpt-3.5-turbo", "gpt-3.5-turbo-16k", "gpt-4"].includes(model)) {
      const openAiModel: SupportedOpenAiModels = model as SupportedOpenAiModels;

      switch (summarizationType) {
        case SummaryMode.EACH_FILE_IN_CHUNKS:
          openAiSummarizeEachFileInChunks(
            {
              format,
              length,
              language,
              model: openAiModel,
              mode,
            },
            email,
            files,
            bucket,
            job,
            locale,
            done
          );
          break;
        case SummaryMode.EACH_FILE_OVERALL:
          openAiSummarizeEachFileOverall(
            {
              format,
              length,
              language,
              model: openAiModel,
              mode,
            },
            email,
            files,
            bucket,
            job,
            locale,
            done
          );
          break;
        case SummaryMode.OVERALL:
          openAiSummarizeFilesOverall(
            {
              format,
              length,
              language,
              model: openAiModel,
              mode,
            },
            email,
            files,
            bucket,
            job,
            locale,
            done
          );
          break;
        case SummaryMode.EACH_FILE_PER_PAGE:
          openAiSummarizeEachFilePerPage(
            {
              format,
              length,
              language,
              model: openAiModel,
              mode,
            },
            email,
            files,
            bucket,
            job,
            locale,
            done
          );
          break;
        default:
          throw new Error("TODO");
      }
    } else if (
      [
        "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
      ].includes(model)
    ) {
      const replicateModel: SupportedReplicateModels =
        model as SupportedReplicateModels;

      switch (summarizationType) {
        case SummaryMode.EACH_FILE_IN_CHUNKS:
          replicateSummarizeEachFileInChunks(
            {
              format,
              length,
              language,
              model: replicateModel,
              mode,
            },
            email,
            files,
            bucket,
            job,
            locale,
            done
          );
          break;
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
