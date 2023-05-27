import { summarize } from "./handlers";

import { Router } from "express";

import { authenticateToken } from "@middleware/index";
import { multerS3Middleware } from "@middleware/index";
import { uploadToDiskMiddleware } from "@/middleware/multer-disk";

const router = Router();

// router
//   .route("/upload")
//   .post([multerS3Middleware.array("documents", 3)], upload);

router.route("/summarize").post([authenticateToken], summarize);

// router
//   .route("/summarize")
//   .post([uploadToDiskMiddleware.single("file")], summarize);

export default router;
