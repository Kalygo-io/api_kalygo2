import express, { NextFunction, Request, Response } from "express";

import version from "@/version.json";

const router = express.Router();

router.get(
  "/",
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).send(version.commitHash);
    } catch (e) {
      throw e;
    }
  }
);

export default router;
