import express, { Request, Response, NextFunction } from "express";

export interface ErrorResponseBodyDto {
  message: string;
}

export interface ResponseBodyDto {
  message: any;
  language: string;
  languages: readonly string[];
}

const router = express.Router();

router.get(
  "/",
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const responseBody: ResponseBodyDto = {
        message: req.t("common:hello"),
        language: req.i18n.language,
        languages: req.i18n.languages,
      };

      res.status(200).json(responseBody);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
