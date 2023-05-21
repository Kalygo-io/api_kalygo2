import express from "express";

import version from "./version";

const router = express.Router();

router.use("/version", version);

export default router;
