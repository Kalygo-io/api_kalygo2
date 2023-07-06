import { getSaasStats } from "./handlers";

import { Router } from "express";

const router = Router();

router.route("/saas-stats").get(getSaasStats);

export default router;
 