import { Router } from "express";

import { uploadToDiskMiddleware } from "@/middleware/multer-disk";
import { promptAgainstData } from "./handlers/promptAgainstData";

const router = Router();

router
  .route("/prompt-against-data")
  .post([uploadToDiskMiddleware.array("database", 1)], promptAgainstData);

export default router;
