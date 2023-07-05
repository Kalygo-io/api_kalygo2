import { authenticateToken } from "@/middleware";
import { downloadFile } from "./handlers";

import { Router } from "express";

const router = Router();

router.route("/download").get(authenticateToken, downloadFile);

export default router;
