import { ScanningMode } from "@prisma/client";
import { openAiFileInChunks } from "./helpers/customRequestV3Job/variations/openAi/fileInChunks";
import { openAiFileOverall } from "./helpers/customRequestV3Job/variations/openAi/fileOverall";
import { openAiOverall } from "./helpers/customRequestV3Job/variations/openAi/overall";
import { openAiFilePerPage } from "./helpers/customRequestV3Job/variations/openAi/filePerPage";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { CustomRequestV3OpenAiCustomizations } from "@/types/CustomRequestV3OpenAiCustomizations";
import { CustomRequestV3ReplicateCustomizations } from "@/types/CustomRequestV3ReplicateCustomizations";
import { CustomRequestV3AnthropicCustomizations } from "@/types/CustomRequestV3AnthropicCustomizations";
import { CustomRequestV3Params } from "@/types/CustomRequestV3Params";
import {
  supportedAnthropicModels,
  supportedOpenAiModels,
} from "@/config/models";
import { SupportedAnthropicModels } from "@/types/SupportedAnthropicModels";
import { anthropicFileInChunks } from "./helpers/customRequestV3Job/variations/anthropic/fileInChunks";
import { anthropicFileOverall } from "./helpers/customRequestV3Job/variations/anthropic/fileOverall";
import { anthropicOverall } from "./helpers/customRequestV3Job/variations/anthropic/overall";
import { anthropicFilePerPage } from "./helpers/customRequestV3Job/variations/anthropic/filePerPage";

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
    if (!email || !customizations || !locale || !batchId || (!file && !files)) {
      done(new Error("Invalid Data"));
      return;
    }

    console.log("--- model ---", model);

    if (
      [
        ...supportedOpenAiModels,
        "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
      ].includes(model)
    ) {
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

        case ScanningMode.OVERALL:
          openAiOverall(
            customizations as CustomRequestV3OpenAiCustomizations,
            email,
            files!,
            job,
            batchId,
            locale,
            done
          );
          break;

        case ScanningMode.FILE_PER_PAGE:
          openAiFilePerPage(
            customizations as CustomRequestV3OpenAiCustomizations,
            email,
            file!,
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
      supportedAnthropicModels.includes(model as SupportedAnthropicModels)
    ) {
      switch (customizations.scanMode) {
        case ScanningMode.FILE_IN_CHUNKS:
          anthropicFileInChunks(
            customizations as CustomRequestV3AnthropicCustomizations,
            email,
            file!,
            job,
            batchId,
            locale,
            done
          );
          break;

        case ScanningMode.FILE_OVERALL:
          anthropicFileOverall(
            customizations as CustomRequestV3AnthropicCustomizations,
            email,
            file!,
            job,
            batchId,
            locale,
            done
          );
          break;

        case ScanningMode.OVERALL:
          anthropicOverall(
            customizations as CustomRequestV3AnthropicCustomizations,
            email,
            files!,
            job,
            batchId,
            locale,
            done
          );
          break;

        case ScanningMode.FILE_PER_PAGE:
          anthropicFilePerPage(
            customizations as CustomRequestV3AnthropicCustomizations,
            email,
            file!,
            job,
            batchId,
            locale,
            done
          );
          break;

        default:
          throw new Error("Unsupported Data Scanning Mode");
      }
    } else {
      throw new Error("Unsupported Model");
    }
  } catch (e: any) {
    done(new Error(e ? e.message : "Something went wrong"));
  }
}
