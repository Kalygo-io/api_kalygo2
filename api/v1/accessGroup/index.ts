import { createAccessGroup } from "./handlers";
import { Router } from "express";
import { authenticateToken } from "@middleware/index";
import { deleteAccessGroup } from "./handlers/delete";

const router = Router();

router.route("/access-group").post(authenticateToken, createAccessGroup);
router.route("/access-group/:id").delete(authenticateToken, deleteAccessGroup);

export default router;
