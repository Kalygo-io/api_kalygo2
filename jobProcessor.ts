import { jobQueue } from "@/clients/bull_client";
import { QueueJobTypes } from "@/types/JobTypes";
import { summaryJobLogic } from "@/jobHandlers/summary";
import { vectorSearchJobLogic } from "@/jobHandlers/vectorSearch";

jobQueue.process(async function (job, done) {
  try {
    console.log("processing JOB...", job.data);

    const { jobType, params } = job.data;

    switch (jobType) {
      case QueueJobTypes.Summary:
        console.log("QueueJobTypes.Summary");
        await summaryJobLogic(params, job, done);
        break;
      case QueueJobTypes.VectorSearch:
        console.log("QueueJobTypes.VectorSearch");
        await vectorSearchJobLogic(params, job, done);
        break;
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
});
