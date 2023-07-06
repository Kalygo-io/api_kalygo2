import { joinMailingList } from "./handlers";

import { Router } from "express";

const router = Router();

router.route("/join").post([], joinMailingList);

export default router;

