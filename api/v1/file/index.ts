import { Router } from "express";
import { getFiles } from "./handlers";
import { authenticateToken, isAdmin } from "@/middleware";

const router = Router();

router.route("/file").get(isAdmin, getFiles);

export default router;
