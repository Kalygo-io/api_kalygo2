import express from "express";

import healthCheck from "./healthCheck";

const router = express.Router();

router.use(healthCheck);

export default router;