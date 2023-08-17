import {
  createStripeAccount,
  getAccount,
  patchAccount,
  addStripeCard,
  getStripeCards,
  deleteStripeCard,
  changePlan,
  deleteAccount,
  cancelSubscription,
  getAccountPaymentMethods,
} from "./handlers";

import { Router } from "express";
import { authenticateToken } from "@middleware/index";
import { buyCredits } from "./handlers/buyCredits";

const router = Router();

router
  .route("/create-stripe-account")
  .get(authenticateToken, createStripeAccount);

router.route("/add-stripe-card").post(authenticateToken, addStripeCard);
router.route("/delete-stripe-card").delete(authenticateToken, deleteStripeCard);
router.route("/get-stripe-cards").get(authenticateToken, getStripeCards);
router
  .route("/get-account-payment-methods")
  .get(authenticateToken, getAccountPaymentMethods);

router
  .route("/cancel-subscription")
  .delete(authenticateToken, cancelSubscription);
router.route("/buy-credits").post(authenticateToken, buyCredits);
router.route("/change-plan").patch(authenticateToken, changePlan);
router.route("/").patch(authenticateToken, patchAccount);
router.route("/").get(authenticateToken, getAccount);
router.route("/").delete(authenticateToken, deleteAccount);

export default router;
