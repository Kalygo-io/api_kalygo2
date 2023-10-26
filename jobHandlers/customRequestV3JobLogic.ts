import { ScanningMode } from "@prisma/client";
import { openAiFileInChunks } from "./helpers/customRequestV3Job/variations/openAi/fileInChunks";
import { openAiFileOverall } from "./helpers/customRequestV3Job/variations/openAi/fileOverall";
import { promptAgainstFilesOverall } from "./helpers/customRequestJob/variations/overall";
import { eachFilePerPage } from "./helpers/customRequestJob/variations/eachFilePerPage";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { CustomRequestV3OpenAiCustomizations } from "@/types/CustomRequestV3OpenAiCustomizations";
import { CustomRequestV3ReplicateCustomizations } from "@/types/CustomRequestV3ReplicateCustomizations";
import { CustomRequestV3Params } from "@/types/CustomRequestV3Params";

export async function customRequestV3JobLogic(
  params: CustomRequestV3Params,
  job: any,
  done: (err?: Error | null, result?: any) => void
) {
  try {
    console.log("processing JOB with params...", params);
    const {
      file,
      files,
      email,
      customizations,
      customizations: { model },
      locale,
      batchId,
    } = params;
    console.log(file, files, email, customizations, locale, batchId);
    if (!email || !customizations || !locale || !batchId) {
      done(new Error("Invalid Data"));
      return;
    }

    if (["gpt-3.5-turbo", "gpt-3.5-turbo-16k", "gpt-4"].includes(model)) {
      switch (customizations.scanMode) {
        case ScanningMode.FILE_IN_CHUNKS:
          openAiFileInChunks(
            customizations as CustomRequestV3OpenAiCustomizations,
            email,
            file!,
            job,
            batchId,
            locale,
            done
          );
          break;

        case ScanningMode.FILE_OVERALL:
          openAiFileOverall(
            customizations as CustomRequestV3OpenAiCustomizations,
            email,
            file!,
            job,
            batchId,
            locale,
            done
          );
          break;

        // case ScanningMode.OVERALL:
        //   promptAgainstFilesOverall(
        //     customizations,
        //     email,
        //     files,
        //     bucket,
        //     job,
        //     locale,
        //     done
        //   );
        //   break;

        // case ScanningMode.EACH_FILE_PER_PAGE:
        //   eachFilePerPage(
        //     customizations,
        //     email,
        //     files,
        //     bucket,
        //     job,
        //     locale,
        //     done
        //   );
        //   break;

        default:
          throw new Error("Unsupported Data Scanning Mode");
      }
    } else if (
      [
        "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
      ].includes(model)
    ) {
      throw new Error("Unsupported Data Scanning Mode");
    } else {
      throw new Error("Unsupported Model");
    }
  } catch (e: any) {
    done(new Error(e ? e.message : "Something went wrong"));
  }
}
