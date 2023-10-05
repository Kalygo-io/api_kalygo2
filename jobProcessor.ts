import { jobQueue } from "@/clients/bull_client";
import { QueueJobTypes } from "@/types/JobTypes";
import { summaryJobLogic } from "@/jobHandlers/summaryJobLogic";
import { summaryV2JobLogic } from "@/jobHandlers/summaryV2JobLogic";
import { vectorSearchJobLogic } from "@/jobHandlers/vectorSearchLogic";
import { customRequestJobLogic } from "@/jobHandlers/customRequestJobLogic";
import { sendEmailJobLogic } from "@/jobHandlers/sendEmailJobLogic";
import { ragRequestJobLogic } from "@/jobHandlers/ragRequestJobLogic";

jobQueue.process(async function (job, done) {
  try {
    console.log("processing JOB...", job.data);
    // console.log(process.env.S3_DOCUMENT_BUCKET);

    const { jobType, params } = job.data;

    switch (jobType) {
      case QueueJobTypes.Summary:
        console.log("QueueJobTypes.Summary");
        await summaryJobLogic(params, job, done);
        break;
      case QueueJobTypes.SummaryV2:
        console.log("QueueJobTypes.SummaryV2");
        await summaryV2JobLogic(params, job, done);
        break;
      case QueueJobTypes.VectorSearch:
        console.log("QueueJobTypes.VectorSearch");
        await vectorSearchJobLogic(params, job, done);
        break;

      case QueueJobTypes.CustomRequest:
        console.log("QueueJobTypes.CustomRequest");
        await customRequestJobLogic(params, job, done);
        break;
      case QueueJobTypes.SendEmail:
        console.log("QueueJobTypes.SendEmail");
        await sendEmailJobLogic(params, job, done);
        break;
      case QueueJobTypes.RagRequest:
        console.log("QueueJobTypes.RagRequest");
        await ragRequestJobLogic(params, job, done);
        break;
    }
  } catch (e: any) {
    done(new Error(e ? e.message : "Something went wrong"));
  }
});
