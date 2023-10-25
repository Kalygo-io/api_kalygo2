import { ScanningMode } from "@prisma/client";
import { openAiFileInChunks } from "./helpers/customRequestV2Job/variations/openAi/fileInChunks";
import { eachFileOverall } from "./helpers/customRequestJob/variations/eachFileOverall";
import { promptAgainstFilesOverall } from "./helpers/customRequestJob/variations/overall";
import { eachFilePerPage } from "./helpers/customRequestJob/variations/eachFilePerPage";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { CustomRequestV2OpenAiCustomizations } from "@/types/CustomRequestV2OpenAiCustomizations";
import { CustomRequestV2ReplicateCustomizations } from "@/types/CustomRequestV2ReplicateCustomizations";
import { CustomRequestV2Params } from "@/types/CustomRequestV2Params";

export async function customRequestV2JobLogic(
  params: CustomRequestV2Params,
  job: any,
  done: (err?: Error | null, result?: any) => void
) {
  try {
    console.log("processing JOB with params...", params);
    const { files, email, customizations, locale, batchId, model } = params;
    console.log(files, email, customizations);
    if (!files || !email || !customizations) {
      done(new Error("Invalid Data"));
      return;
    }

    if (["gpt-3.5-turbo", "gpt-3.5-turbo-16k", "gpt-4"].includes(model)) {
      switch (customizations.scanMode) {
        case ScanningMode.FILE_IN_CHUNKS:
          openAiFileInChunks(
            customizations as CustomRequestV2OpenAiCustomizations,
            email,
            files,
            job,
            batchId,
            locale,
            done
          );
          break;

        // case ScanningMode.EACH_FILE_OVERALL:
        //   eachFileOverall(
        //     customizations,
        //     email,
        //     files,
        //     bucket,
        //     job,
        //     locale,
        //     done
        //   );
        //   break;

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
          throw new Error("TODO");
      }
    } else if (
      [
        "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
      ].includes(model)
    ) {
      throw new Error("TODO");
    } else {
      throw new Error("Unsupported Model");
    }
  } catch (e: any) {
    done(new Error(e ? e.message : "Something went wrong"));
  }
}
