import { authenticateToken, multerS3Middleware } from "@/middleware";
import {
  customRequest,
  getCustomRequest,
  getCustomRequests,
  rateCustomRequest,
} from "./handlers";

import { Router } from "express";
import canCallerPushToQueue from "@/middleware/canCallerPushToQueue";
import { addToAccessGroup } from "./handlers/addToAccessGroup";
import { removeFromAccessGroup } from "./handlers/removeFromAccessGroup";
import { getPublicCustomRequest } from "./handlers/getPublicCustomRequest";
import { isCustomRequestPublic } from "@middleware/index";

const router = Router();

router
  .route("/custom-request")
  .post(
    [
      multerS3Middleware.array("documents"),
      authenticateToken,
      canCallerPushToQueue,
    ],
    customRequest
  );

router.route("/custom-request/:id").get([authenticateToken], getCustomRequest);
router.route("/custom-requests").get([authenticateToken], getCustomRequests);

router
  .route("/get-public-custom-request/:id")
  .get([isCustomRequestPublic], getPublicCustomRequest);

router
  .route("/rate-custom-request/:id")
  .post([authenticateToken], rateCustomRequest);

router
  .route("/add-custom-request-to-access-group")
  .post([authenticateToken], addToAccessGroup);

router
  .route("/remove-custom-request-from-access-group")
  .delete([authenticateToken], removeFromAccessGroup);

export default router;
