import express from "express";

import reload from "./reload";

const router = express.Router();

router.use("/i18n", reload);

export default router;