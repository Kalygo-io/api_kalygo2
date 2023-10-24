import {
  createAccessGroup,
  deleteAccessGroup,
  deleteSummaryV2FromAccessGroup,
  deleteSummaryV3FromAccessGroup,
  getAccessGroup,
  deleteAccountFromAccessGroup,
  addAccountToAccessGroup,
  deleteCustomRequestFromAccessGroup,
  deletePromptFromAccessGroup,
} from "./handlers";
import { Router } from "express";
import { authenticateToken } from "@middleware/index";
import { isAccessGroupOwner } from "@/middleware/isAccessGroupOwner";

const router = Router();

router.route("/access-group").post(authenticateToken, createAccessGroup);
router.route("/access-group/:id").delete(authenticateToken, deleteAccessGroup);
router.route("/access-group/:id").get(authenticateToken, getAccessGroup);

router
  .route("/delete-account-from-access-group/:id")
  .delete(authenticateToken, isAccessGroupOwner, deleteAccountFromAccessGroup);

router
  .route("/delete-summary-v2-from-access-group/:id")
  .delete(
    authenticateToken,
    isAccessGroupOwner,
    deleteSummaryV2FromAccessGroup
  );

router
  .route("/delete-summary-v3-from-access-group/:id")
  .delete(
    authenticateToken,
    isAccessGroupOwner,
    deleteSummaryV3FromAccessGroup
  );

router
  .route("/delete-custom-request-from-access-group/:id")
  .delete(
    authenticateToken,
    isAccessGroupOwner,
    deleteCustomRequestFromAccessGroup
  );

router
  .route("/delete-prompt-from-access-group/:id")
  .delete(authenticateToken, isAccessGroupOwner, deletePromptFromAccessGroup);

router
  .route("/add-account-to-access-group/:id")
  .post(authenticateToken, isAccessGroupOwner, addAccountToAccessGroup);

export default router;
