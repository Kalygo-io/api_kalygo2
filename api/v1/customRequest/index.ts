import { authenticateToken, multerS3Middleware } from "@/middleware";
import { customRequest, getCustomRequest, getCustomRequests } from "./handlers";

import { Router } from "express";

const router = Router();

router
  .route("/custom-request")
  .post(
    [authenticateToken, multerS3Middleware.array("documents")],
    customRequest
  );

router.route("/custom-request/:id").get([authenticateToken], getCustomRequest);
router.route("/custom-requests").get([authenticateToken], getCustomRequests);

export default router;
