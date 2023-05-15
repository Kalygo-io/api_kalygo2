import { generalFeedback } from "./handlers";

import { Router } from "express";

const router = Router();

router.route("/general").post(generalFeedback);

export default router;
