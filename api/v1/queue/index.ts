import {
  clearQueue,
  viewQueue,
  removeJobFromQueue,
  retryJob,
} from "./handlers";
import { Router } from "express";
import { authenticateToken, isAdmin, isJobCreator } from "@middleware/index";

const router = Router();
router.route("/clear-queue").post([authenticateToken, isAdmin], clearQueue);
router.route("/view-queue").get([authenticateToken], viewQueue);
router
  .route("/remove-job-from-queue")
  .delete([authenticateToken, isJobCreator], removeJobFromQueue);
router.route("/retry-job").post([authenticateToken, isJobCreator], retryJob);

export default router;
