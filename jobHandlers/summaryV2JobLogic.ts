import { SummaryMode } from "@prisma/client";

import { summarizeEachFileOverall } from "@/jobHandlers/helpers/summaryV2Job/variations/eachFileOverall";
import { summarizeEachFileInChunks } from "@/jobHandlers/helpers/summaryV2Job/variations/eachFileInChunks";
import { summarizeFilesOverall } from "@/jobHandlers/helpers/summaryV2Job/variations/overall";
import { summarizeEachFilePerPage } from "@/jobHandlers/helpers/summaryV2Job/variations/eachFilePerPage";
import { SummaryV2Customizations } from "@/types/SummaryV2Customizations";

export async function summaryV2JobLogic(
  params: {
    bucket: string;
    files: any[];
    email: string;
    customizations: SummaryV2Customizations;
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

    switch (summarizationType) {
      case SummaryMode.EACH_FILE_IN_CHUNKS:
        summarizeEachFileInChunks(
          {
            format,
            length,
            language,
            model,
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
        summarizeEachFileOverall(
          {
            format,
            length,
            language,
            model,
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
        summarizeFilesOverall(
          {
            format,
            length,
            language,
            model,
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
        summarizeEachFilePerPage(
          {
            format,
            length,
            language,
            model,
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
  } catch (e: any) {
    done(new Error(e ? e.message : "Something went wrong"));
  }
}
