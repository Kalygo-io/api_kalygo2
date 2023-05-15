import express from "express";
import healthCheck from "./healthCheck";
import i18n from "./i18n";
import testDb from "./testDb";
import auth from "./auth";
// import messages from "./messages";

const router = express.Router();

router.use(healthCheck);
router.use(i18n);
router.use(testDb);
router.use("/auth", auth);
// router.use(messages);

export default router;
