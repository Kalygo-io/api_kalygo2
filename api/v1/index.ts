import express from "express";
import healthCheck from "./healthCheck";
import i18n from "./i18n";
import auth from "./auth";
import feedback from "./feedback";
import version from "./version";
import summarize from "./summarize";
import account from "./account";
import similaritySearch from "./similarity";
import mailingList from "./mailingList";
import admin from "./admin";
import download from "./download";
import customRequest from "./customRequest";
import queue from "./queue";

const router = express.Router();

router.use(healthCheck);
router.use(version);
router.use(i18n);

router.use("/auth", auth);
router.use("/admin", admin);
router.use("/mailingList", mailingList);
router.use("/account", account);
router.use("/feedback", feedback);

router.use(customRequest);
router.use(download);
router.use(summarize);
router.use(similaritySearch);
router.use(queue);

export default router;
