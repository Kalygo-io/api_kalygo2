import { authenticateToken, multerS3Middleware } from "@/middleware";
import {
  customRequest,
  getCustomRequest,
  getCustomRequests,
  rateCustomRequest,
  addToAccessGroup,
  removeFromAccessGroup,
  getPublicCustomRequest,
  customRequestV3,
  getCustomRequestV3,
  getCustomRequestV3s,
  rateCustomRequestV3,
  addCustomRequestV3ToAccessGroup,
  removeCustomRequestV3FromAccessGroup,
  getPublicCustomRequestV3,
} from "./handlers";

import { Router } from "express";
import canCallerPushToQueue from "@/middleware/canCallerPushToQueue";

import { isCustomRequestPublic } from "@middleware/index";
import { isCustomRequestV3Public } from "@/middleware/isCustomRequestV3Public";

const router = Router();

// CustomRequest

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

// CustomRequestV3

router
  .route("/custom-request-v3")
  .post(
    [
      multerS3Middleware.array("documents"),
      authenticateToken,
      canCallerPushToQueue,
    ],
    customRequestV3
  );
router
  .route("/custom-request-v3/:id")
  .get([authenticateToken], getCustomRequestV3);
router
  .route("/custom-requests-v3")
  .get([authenticateToken], getCustomRequestV3s);
router
  .route("/get-public-custom-request-v3/:id")
  .get([isCustomRequestV3Public], getPublicCustomRequestV3);
router
  .route("/rate-custom-request-v3/:id")
  .post([authenticateToken], rateCustomRequestV3);
router
  .route("/add-custom-request-v3-to-access-group")
  .post([authenticateToken], addCustomRequestV3ToAccessGroup);
router
  .route("/remove-custom-request-v3-from-access-group")
  .delete([authenticateToken], removeCustomRequestV3FromAccessGroup);

export default router;
