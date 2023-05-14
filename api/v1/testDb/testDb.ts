import express, { NextFunction, Request, Response } from "express";

export interface ResponseBodyDto {
  message: any;
}

const router = express.Router();

router.get(
  "/testDb",
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      req.i18n.reloadResources();
      res.status(200).send("OK");
    } catch (e) {
      throw e;
    }
  }
);

export default router;