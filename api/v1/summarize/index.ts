import {
  summarize,
  summarizeV2,
  getSummarizationQuote,
  accountSummaries,
  getSummary,
  getSummaryV2,
  getSummariesV2,
} from "./handlers";

import { Router } from "express";

import { authenticateToken } from "@middleware/index";
import { multerS3Middleware } from "@middleware/index";
import { uploadToDiskMiddleware } from "@/middleware/multer-disk";

const router = Router();

// router
//   .route("/upload")
//   .post([multerS3Middleware.array("documents", 3)], upload);

router.route("/summarize").post([authenticateToken], summarize);
router
  .route("/summarize-v2")
  .post(
    [authenticateToken, multerS3Middleware.array("documents")],
    summarizeV2
  );

// router
//   .route("/summarize")
//   .post([authenticateToken, uploadToDiskMiddleware.single("file")], summarize);

router.route("/account-summaries").get([authenticateToken], accountSummaries);
router.route("/summaries-v2").get([authenticateToken], getSummariesV2);

router.route("/get-summary/:id").get([authenticateToken], getSummary);
router.route("/get-summary-v2/:id").get([authenticateToken], getSummaryV2);

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
