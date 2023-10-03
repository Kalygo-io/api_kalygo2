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
  getAccountById,
  getPurchaseHistory,
  getAccessGroups,
  getAccountWithAccessGroups,
  getPrompts,
  uploadContextDocument,
  getContextDocuments,
  deleteContextDocument,
  downloadContextDocument,
  uploadAvatar,
} from "./handlers";

import { Router } from "express";
import { authenticateToken, isAdmin } from "@middleware/index";
import { buyCredits } from "./handlers/buyCredits";
import { multerS3Middleware } from "@middleware/index";
import { getFiles } from "./handlers/getFiles";

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
  .route("/get-purchase-history")
  .get(authenticateToken, getPurchaseHistory);

router.route("/get-prompts").get(authenticateToken, getPrompts);

router.route("/get-files").get(authenticateToken, getFiles);

router.route("/get-access-groups").get(authenticateToken, getAccessGroups);

router
  .route("/cancel-subscription")
  .delete(authenticateToken, cancelSubscription);
router.route("/buy-credits").post(authenticateToken, buyCredits);
router.route("/change-plan").patch(authenticateToken, changePlan);
router.route("/").get(authenticateToken, getAccount);

router
  .route("/get-account-with-access-groups")
  .get(authenticateToken, getAccountWithAccessGroups);

router.route("/:id").get([authenticateToken, isAdmin], getAccountById);

router.route("/").patch(authenticateToken, patchAccount);
router.route("/").delete(authenticateToken, deleteAccount);
router
  .route("/upload-context-document")
  .post(
    [authenticateToken, isAdmin, multerS3Middleware.single("contextDocument")],
    uploadContextDocument
  );

router
  .route("/upload-avatar")
  .post([authenticateToken, multerS3Middleware.single("avatar")], uploadAvatar);

router
  .route("/get-context-documents/:accountId")
  .get([authenticateToken, isAdmin], getContextDocuments);

router
  .route("/delete-context-document")
  .delete([authenticateToken, isAdmin], deleteContextDocument);

router
  .route("/download-context-document")
  .post([authenticateToken, isAdmin], downloadContextDocument);

export default router;
