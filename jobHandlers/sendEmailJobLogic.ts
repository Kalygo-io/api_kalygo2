import { ScanningMode } from "@prisma/client";
import { CustomRequestCustomizations } from "@/types/CustomRequestCustomizations";
import { eachFileInChunks } from "./helpers/customRequestJob/variations/eachFileInChunks";
import { eachFileOverall } from "./helpers/customRequestJob/variations/eachFileOverall";
import { promptAgainstFilesOverall } from "./helpers/customRequestJob/variations/overall";
import { eachFilePerPage } from "./helpers/customRequestJob/variations/eachFilePerPage";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";

export async function sendEmailJobLogic(
  params: {
    locale: string;
  },
  job: any,
  done: (err?: Error | null, result?: any) => void
) {
  try {
    console.log("processing sendEmailJobLogic with params...", params);
    // const { files, bucket, email, customizations, language, locale } = params;
    // console.log(bucket, files, email, customizations, language);
    // if (!bucket || !files || !email || !customizations || !language) {
    //   done(new Error("Invalid Data"));
    //   return;
    // }
  } catch (e: any) {
    done(new Error(e ? e.message : "Something went wrong"));
  }
}
