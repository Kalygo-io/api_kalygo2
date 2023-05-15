import express from "express";
import v1router from "./v1";

const router = express.Router();
router.use("/v1", v1router);

export default router;
