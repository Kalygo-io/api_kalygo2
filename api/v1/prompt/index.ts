import { getPrompt, deletePrompt } from "./handlers";

import { Router } from "express";
import { authenticateToken } from "@middleware/index";

const router = Router();

router.route("/prompt/:id").delete(authenticateToken, deletePrompt);
router.route("/prompt/:id").get(authenticateToken, getPrompt);

export default router;
