import { createStripeAccount, getAccount, patchAccount } from "./handlers";

import { Router } from "express";
import { authenticateToken } from "@middleware/index";

const router = Router();

router
  .route("/create-stripe-account")
  .get(authenticateToken, createStripeAccount);

router.route("/").patch(authenticateToken, patchAccount);

router.route("/").get(authenticateToken, getAccount);

export default router;
