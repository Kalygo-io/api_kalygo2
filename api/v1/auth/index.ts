import {
  isAuthed,
  // clearAccounts,
  logIn,
  signUp,
  signOut,
  resetPassword,
  mockRequestPasswordReset,
  requestPasswordReset,
  verifyAccount,
  mockReceiveVerificationToken,
  subscriptionSignUp,
  isAdmin,
} from "./handlers";

import { Router } from "express";
import { authenticateToken } from "@middleware/index";

const router = Router();

router.route("/is-authed").get(authenticateToken, isAuthed);
router.route("/log-in").post(logIn);
router.route("/sign-up").post(signUp);
router.route("/subscription-sign-up").post(subscriptionSignUp);
router.route("/sign-out").delete(authenticateToken, signOut);
router.route("/request-password-reset").post(requestPasswordReset);
router.route("/mock-request-password-reset").post(mockRequestPasswordReset);
router
  .route("/mock-receive-verification-token")
  .post(mockReceiveVerificationToken);
router.route("/verify-account").post(verifyAccount);
router.route("/reset-password").post(resetPassword);
router.route("/is-admin").get(isAdmin);
// router.route("/accounts").delete(clearAccounts);

export default router;
