import { createReferralCode } from "./handlers";

import { Router } from "express";
import { authenticateToken, multerS3Middleware } from "@middleware/index";

const router = Router();

router.route("/create-code").post([authenticateToken], createReferralCode);

export default router;
