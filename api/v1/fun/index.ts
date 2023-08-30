import { authenticateToken } from "@/middleware";
import { sendEmail } from "./handlers";

import { Router } from "express";
import canCallerPushToQueue from "@/middleware/canCallerPushToQueue";

const router = Router();

router.route("/send-email").post([authenticateToken], sendEmail);

export default router;
