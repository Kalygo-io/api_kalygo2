import { getSaasStats } from "./handlers";
import { allocateSummaryCredits } from "./handlers";
import { allocateSearchCredits } from "./handlers";
import { allocateCustomRequestCredits } from "./handlers";
import { checkAdminFrontend } from "./handlers";
import { authenticateToken } from "@/middleware";
import { isAdmin } from "@/middleware";

import { Router } from "express";

const router = Router();

router.route("/saas-stats").get(authenticateToken, isAdmin, getSaasStats);
router.route("/allocate-summary-credits").post(authenticateToken, isAdmin, allocateSummaryCredits);
router.route("/allocate-search-credits").post(authenticateToken, isAdmin, allocateSearchCredits);
router.route("/allocate-custom-request-credits").post(authenticateToken, isAdmin, allocateCustomRequestCredits);
router.route("/check-admin").get(authenticateToken, isAdmin, checkAdminFrontend);

export default router;
 