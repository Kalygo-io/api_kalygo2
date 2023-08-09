import { clearQueue, viewQueue, removeJobFromQueue } from "./handlers";

import { Router } from "express";

import { authenticateToken, isAdmin } from "@middleware/index";
import { multerS3Middleware } from "@middleware/index";
import { uploadToDiskMiddleware } from "@/middleware/multer-disk";

const router = Router();

router.route("/clear-queue").post([authenticateToken, isAdmin], clearQueue);
router.route("/view-queue").get([authenticateToken], viewQueue);
router
  .route("/remove-job-from-queue")
  .delete([authenticateToken, isAdmin], removeJobFromQueue);

export default router;
