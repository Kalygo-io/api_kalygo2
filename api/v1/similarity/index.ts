import {
  similaritySearch,
  similaritySearchWithQueue,
  getVectorSearch,
  downloadOriginalFile,
  downloadOriginalFileAsAttachment,
  getVectorSearches,
} from "./handlers";

import { Router } from "express";

import { authenticateToken } from "@middleware/index";
import { multerS3Middleware } from "@middleware/index";
import { uploadToDiskMiddleware } from "@/middleware/multer-disk";

const router = Router();

router
  .route("/vector-search/download-original-file/:id")
  .get([authenticateToken], downloadOriginalFile);

router
  .route("/vector-search/download-original-file-as-attachment/:id")
  .get([authenticateToken], downloadOriginalFileAsAttachment);

router.route("/vector-search/:id").get([authenticateToken], getVectorSearch);
router.route("/vector-searches").get([authenticateToken], getVectorSearches);

router
  .route("/similarity-search")
  .post(
    [authenticateToken, uploadToDiskMiddleware.single("file")],
    similaritySearch
  );

router
  .route("/similarity-search-with-queue")
  .post(
    [authenticateToken, multerS3Middleware.single("file")],
    similaritySearchWithQueue
  );

export default router;
