import { performSimilaritySearch } from "./handlers";

import { Router } from "express";

import { authenticateToken } from "@middleware/index";
import { multerS3Middleware } from "@middleware/index";
import { uploadToDiskMiddleware } from "@/middleware/multer-disk";

const router = Router();

// router
//   .route("/upload")
//   .post([multerS3Middleware.array("documents", 3)], upload);

// router.route("/summarize").post([authenticateToken], summarize);

router
  .route("/similarity-search")
  .post(
    [authenticateToken, uploadToDiskMiddleware.single("file")],
    performSimilaritySearch
  );

export default router;