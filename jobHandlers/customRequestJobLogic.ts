import prisma from "@/db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import { OpenAI } from "@/clients/openai_client";
import get from "lodash.get";
import { s3, GetObjectCommand } from "@/clients/s3_client";

import { ScanningMode } from "@prisma/client";
import { CustomRequestCustomizations } from "@/types/CustomRequestCustomizations";
import { eachFileInChunks } from "./helpers/customRequestJob/variations/eachFileInChunks";
import { eachFileOverall } from "./helpers/customRequestJob/variations/eachFileOverall";
import { promptAgainstFilesOverall } from "./helpers/customRequestJob/variations/overall";

export async function customRequestJobLogic(
  params: {
    bucket: string;
    files: any[];
    email: string;
    customizations: CustomRequestCustomizations;
    language: string;
    model: "gpt-3.5-turbo" | "gpt-4";
    locale: string;
  },
  job: any,
  done: (err?: Error | null, result?: any) => void
) {
  // const enc = encoding_for_model(params.model);
  // function sleep(ms: number) {
  //   return new Promise((resolve) => setTimeout(resolve, ms));
  // }
  // function isPartsValid(parts: string[]): boolean {
  //   for (let i = 0; i < parts.length; i++) {
  //     if (enc.encode(parts[i]).length > 4096) return false;
  //   }
  //   return true;
  // }

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

      default:
        throw new Error("TODO");
    }
  } catch (e: any) {
    done(new Error(e ? e.message : "Something went wrong"));
  }
}
