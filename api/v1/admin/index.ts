import {
  getUsageStats,
  allocateSummaryCredits,
  allocateSearchCredits,
  allocateCustomRequestCredits,
  getAccounts,
  getAccountsWithCard,
  getLogins,
  getCharges,
} from "./handlers";
import { authenticateToken } from "@/middleware";
import { isAdmin } from "@/middleware";
import { Router } from "express";

const router = Router();

router.route("/dashboard").get(authenticateToken, isAdmin, getUsageStats);
router.route("/get-accounts").get(authenticateToken, isAdmin, getAccounts);
router
  .route("/get-accounts-with-card")
  .get(authenticateToken, isAdmin, getAccountsWithCard);
router.route("/get-charges").get(authenticateToken, isAdmin, getCharges);
router.route("/get-logins").get(authenticateToken, isAdmin, getLogins);
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
