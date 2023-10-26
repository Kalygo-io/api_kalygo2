import { getRag, ragRequestWithQueue } from "./handlers";

import { Router } from "express";
import {
  authenticateToken,
  isAdmin,
  multerS3Middleware,
} from "@middleware/index";

const router = Router();

router
  .route("/rag-request-with-queue")
  .post(
    [authenticateToken, isAdmin, multerS3Middleware.single("file")],
    ragRequestWithQueue
  );

router.route("/rag/:id").get([authenticateToken], getRag);

export default router;
