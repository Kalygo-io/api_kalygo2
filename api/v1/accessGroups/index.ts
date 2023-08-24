import { createAccessGroup } from "./handlers";
import { Router } from "express";
import { authenticateToken } from "@middleware/index";

const router = Router();

router.route("/access-group/create").get(authenticateToken, createAccessGroup);

export default router;
