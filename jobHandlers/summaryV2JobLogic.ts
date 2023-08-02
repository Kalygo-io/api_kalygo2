import { SummarizationTypes } from "@/types/SummarizationTypes";

import { summarizeEachFileOverall } from "@/jobHandlers/helpers/summaryV2Job/variations/eachFileOverall";
import { summarizeEachFileInChunks } from "@/jobHandlers/helpers/summaryV2Job/variations/eachFileInChunks";
import { summarizeFilesOverall } from "@/jobHandlers/helpers/summaryV2Job/variations/overall";

export async function summaryV2JobLogic(
  params: {
    bucket: string;
    files: any[];
    email: string;
    customizations: Record<string, string>;
    language: string;
  },
  job: any,
  done: (err?: Error | null, result?: any) => void
) {
  try {
    console.log("processing JOB with params...", params);
    const { files, bucket, email, customizations, language } = params;
    console.log(bucket, files, email, customizations, language);
    if (!bucket || !files || !email || !customizations || !language) {
      done(new Error("Invalid Data"));
      return;
    }

    const summarizationType = customizations.type;

    switch (summarizationType) {
      case SummarizationTypes.EachFileInChunks:
        summarizeEachFileInChunks(
          {
            format: customizations.format,
            length: customizations.length,
            language: customizations.language,
          },
          email,
          files,
          bucket,
          job,
          done
        );
        break;
      case SummarizationTypes.EachFileOverall:
        summarizeEachFileOverall(
          {
            format: customizations.format,
            length: customizations.length,
            language: customizations.language,
          },
          email,
          files,
          bucket,
          job,
          done
        );
        break;
      case SummarizationTypes.Overall:
        summarizeFilesOverall(
          {
            format: customizations.format,
            length: customizations.length,
            language: customizations.language,
          },
          email,
          files,
          bucket,
          job,
          done
        );
        break;
      default:
        throw new Error("TODO");
    }
  } catch (e: any) {
    done(new Error(e ? e.message : "Something went wrong"));
  }

  // // or give an error if error
  // done(new Error('error transcoding'));
  // // or pass it a result
  // done(null, { framerate: 29.5 /* etc... */ });
  // // If the job throws an unhandled exception it is also handled correctly
  // throw new Error('some unexpected error');
}
