import { clearQueue, viewQueue, removeJobFromQueue } from "./handlers";

import { Router } from "express";

import { authenticateToken } from "@middleware/index";
import { multerS3Middleware } from "@middleware/index";
import { uploadToDiskMiddleware } from "@/middleware/multer-disk";

const router = Router();

router.route("/clear-queue").post([authenticateToken], clearQueue);
router.route("/view-queue").get([authenticateToken], viewQueue);
router
  .route("/remove-job-from-queue")
  .delete([authenticateToken], removeJobFromQueue);

export default router;
