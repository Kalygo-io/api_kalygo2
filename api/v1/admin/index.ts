import {
  getUsageStats,
  allocateSummaryCredits,
  allocateSearchCredits,
  allocateCustomRequestCredits,
} from "./handlers";
import { authenticateToken } from "@/middleware";
import { isAdmin } from "@/middleware";
import { Router } from "express";
import { getAccounts } from "./handlers/getAccounts";

const router = Router();

router.route("/dashboard").get(authenticateToken, isAdmin, getUsageStats);

router.route("/get-accounts").get(authenticateToken, isAdmin, getAccounts);

router
  .route("/allocate-summary-credits")
  .post(authenticateToken, isAdmin, allocateSummaryCredits);
router
  .route("/allocate-search-credits")
  .post(authenticateToken, isAdmin, allocateSearchCredits);
router
  .route("/allocate-custom-request-credits")
  .post(authenticateToken, isAdmin, allocateCustomRequestCredits);

export default router;
