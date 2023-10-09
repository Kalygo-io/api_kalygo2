import { Router } from "express";
import { processDoc } from "./handlers";
import { authenticateToken, isAdmin, multerS3Middleware } from "@/middleware";

const router = Router();

router
  .route("/process-doc")
  .post([authenticateToken, multerS3Middleware.single("file")], processDoc);

export default router;
