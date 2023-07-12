import { authenticateToken, multerS3Middleware } from "@/middleware";
import { customRequest, getCustomRequest } from "./handlers";

import { Router } from "express";

const router = Router();

router
  .route("/custom-request")
  .post(
    [authenticateToken, multerS3Middleware.array("documents")],
    customRequest
  );

router.route("/custom-request/:id").get([authenticateToken], getCustomRequest);

export default router;
