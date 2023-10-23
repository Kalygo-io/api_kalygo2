import {
  summarizeV2,
  getSummarizationQuote,
  accountSummaries,
  getSummary,
  getSummaryV2,
  getPublicSummaryV2,
  getSummariesV2,
  rateSummaryV2,
  addToAccessGroup,
  removeFromAccessGroup,
  summarizeV3,
  getSummaryV3,
  getSummariesV3,
  rateSummaryV3,
} from "./handlers";

import { Router } from "express";

import { authenticateToken } from "@middleware/index";
import { multerS3Middleware } from "@middleware/index";
import { isSummaryPublic } from "@middleware/index";
import { uploadToDiskMiddleware } from "@/middleware/multer-disk";
import canCallerPushToQueue from "@/middleware/canCallerPushToQueue";

const router = Router();

router
  .route("/summarize-v2")
  .post(
    [
      multerS3Middleware.array("documents"),
      authenticateToken,
      canCallerPushToQueue,
    ],
    summarizeV2
  );

router
  .route("/summarize-v3")
  .post(
    [
      multerS3Middleware.array("documents"),
      authenticateToken,
      canCallerPushToQueue,
    ],
    summarizeV3
  );

router.route("/account-summaries").get([authenticateToken], accountSummaries);
router.route("/summaries-v2").get([authenticateToken], getSummariesV2);
router.route("/summaries-v3").get([authenticateToken], getSummariesV3);

router.route("/get-summary/:id").get([authenticateToken], getSummary);
router.route("/get-summary-v2/:id").get([authenticateToken], getSummaryV2);
router.route("/get-summary-v3/:id").get([authenticateToken], getSummaryV3);
router
  .route("/get-public-summary-v2/:id")
  .get([isSummaryPublic], getPublicSummaryV2);

router.route("/rate-summary-v2/:id").post([authenticateToken], rateSummaryV2);
router.route("/rate-summary-v3/:id").post([authenticateToken], rateSummaryV3);

router
  .route("/add-summary-to-access-group")
  .post([authenticateToken], addToAccessGroup);

router
  .route("/remove-summary-from-access-group")
  .delete([authenticateToken], removeFromAccessGroup);

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
