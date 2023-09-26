import {
  createAccessGroup,
  deleteAccessGroup,
  deleteSummaryFromAccessGroup,
  getAccessGroup,
  deleteAccountFromAccessGroup,
  addAccountToAccessGroup,
  deleteCustomRequestFromAccessGroup,
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
  .route("/delete-summary-from-access-group/:id")
  .delete(authenticateToken, isAccessGroupOwner, deleteSummaryFromAccessGroup);

router
  .route("/delete-custom-request-from-access-group/:id")
  .delete(
    authenticateToken,
    isAccessGroupOwner,
    deleteCustomRequestFromAccessGroup
  );

router
  .route("/add-account-to-access-group/:id")
  .post(authenticateToken, isAccessGroupOwner, addAccountToAccessGroup);

export default router;
