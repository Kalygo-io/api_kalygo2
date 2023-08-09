import { authenticateToken, multerS3Middleware } from "@/middleware";
import { customRequest, getCustomRequest, getCustomRequests } from "./handlers";

import { Router } from "express";
import canCallerPushToQueue from "@/middleware/canCallerPushToQueue";

const router = Router();

router
  .route("/custom-request")
  .post(
    [
      authenticateToken,
      canCallerPushToQueue,
      multerS3Middleware.array("documents"),
    ],
    customRequest
  );

router.route("/custom-request/:id").get([authenticateToken], getCustomRequest);
router.route("/custom-requests").get([authenticateToken], getCustomRequests);

export default router;
