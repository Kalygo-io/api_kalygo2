import { upload } from "./handlers";

import { Router } from "express";

import { authenticateToken } from "@middleware/index";
import { multerS3Middleware } from "@middleware/index";

const router = Router();

router.route("/upload").post([multerS3Middleware.array("files", 3)], upload);

export default router;
