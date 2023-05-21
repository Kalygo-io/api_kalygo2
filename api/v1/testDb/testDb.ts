import express, { NextFunction, Request, Response } from "express";

import prisma from "@db/prisma_client";

export interface ResponseBodyDto {
  message: any;
}

const router = express.Router();

router.get(
  "/testDb",
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      //   const results = await prisma.$queryRaw`SELECT * FROM film`;
      const allFilms = await prisma.film.findMany();
      res.status(200).send(allFilms);
    } catch (e) {
      throw e;
    }
  }
);

export default router;
