import express, { NextFunction, Request, Response } from "express";

import package_json from "@/package.json";

const router = express.Router();

router.get(
  "/",
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).send(package_json.version);
    } catch (e) {
      throw e;
    }
  }
);

export default router;
