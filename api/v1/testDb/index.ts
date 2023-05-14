import express from "express";

import testDb from "./testDb";

const router = express.Router();

router.use(testDb);

export default router;
