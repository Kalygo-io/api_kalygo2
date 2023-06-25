import {
  summarize,
  getSummarizationQuote,
  accountSummaries,
  getSummary,
  viewQueue,
  removeJobFromQueue,
} from "./handlers";

import { Router } from "express";

import { authenticateToken } from "@middleware/index";
import { multerS3Middleware } from "@middleware/index";
import { uploadToDiskMiddleware } from "@/middleware/multer-disk";
import { clearQueue } from "./handlers/clearQueue";

const router = Router();

// router
//   .route("/upload")
//   .post([multerS3Middleware.array("documents", 3)], upload);

router.route("/summarize").post([authenticateToken], summarize);

router.route("/clear-queue").post([authenticateToken], clearQueue);

router.route("/view-summary-queue").get([authenticateToken], viewQueue);
router
  .route("/remove-job-from-queue")
  .delete([authenticateToken], removeJobFromQueue);

// router
//   .route("/summarize")
//   .post([authenticateToken, uploadToDiskMiddleware.single("file")], summarize);

router.route("/account-summaries").get([authenticateToken], accountSummaries);

router.route("/get-summary/:id").get([authenticateToken], getSummary);

// router.route("/get-summarization-quote").post(
// [authenticateToken, uploadToDiskMiddleware.array("documents", 3)],
// [authenticateToken],
// getSummarizationQuote
// );

router
  .route("/get-summarization-quote")
  .post(
    [authenticateToken, multerS3Middleware.array("documents")],
    getSummarizationQuote
  );

export default router;
