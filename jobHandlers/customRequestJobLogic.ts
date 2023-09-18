import { ScanningMode } from "@prisma/client";
import { CustomRequestCustomizations } from "@/types/CustomRequestCustomizations";
import { eachFileInChunks } from "./helpers/customRequestJob/variations/eachFileInChunks";
import { eachFileOverall } from "./helpers/customRequestJob/variations/eachFileOverall";
import { promptAgainstFilesOverall } from "./helpers/customRequestJob/variations/overall";
import { eachFilePerPage } from "./helpers/customRequestJob/variations/eachFilePerPage";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";

export async function customRequestJobLogic(
  params: {
    bucket: string;
    files: any[];
    email: string;
    customizations: CustomRequestCustomizations;
    language: string;
    model: SupportedOpenAiModels;
    locale: string;
  },
  job: any,
  done: (err?: Error | null, result?: any) => void
) {
  try {
    console.log("processing JOB with params...", params);
    const { files, bucket, email, customizations, language, locale } = params;
    console.log(bucket, files, email, customizations, language);
    if (!bucket || !files || !email || !customizations || !language) {
      done(new Error("Invalid Data"));
      return;
    }

    switch (customizations.mode) {
      case ScanningMode.EACH_FILE_IN_CHUNKS:
        eachFileInChunks(
          customizations,
          email,
          files,
          bucket,
          job,
          locale,
          done
        );
        break;

      case ScanningMode.EACH_FILE_OVERALL:
        eachFileOverall(
          customizations,
          email,
          files,
          bucket,
          job,
          locale,
          done
        );
        break;

      case ScanningMode.OVERALL:
        promptAgainstFilesOverall(
          customizations,
          email,
          files,
          bucket,
          job,
          locale,
          done
        );
        break;

      case ScanningMode.EACH_FILE_PER_PAGE:
        eachFilePerPage(
          customizations,
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
