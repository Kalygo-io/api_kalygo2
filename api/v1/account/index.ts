import {
  createStripeAccount,
  getAccount,
  patchAccount,
  addStripeCard,
  getStripeCards,
  deleteStripeCard,
} from "./handlers";

import { Router } from "express";
import { authenticateToken } from "@middleware/index";

const router = Router();

router
  .route("/create-stripe-account")
  .get(authenticateToken, createStripeAccount);

router.route("/add-stripe-card").post(authenticateToken, addStripeCard);
router.route("/delete-stripe-card").delete(authenticateToken, deleteStripeCard);
router.route("/get-stripe-cards").get(authenticateToken, getStripeCards);

router.route("/").patch(authenticateToken, patchAccount);
router.route("/").get(authenticateToken, getAccount);

export default router;
