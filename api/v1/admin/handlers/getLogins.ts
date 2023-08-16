import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function getLogins(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("req.query", req.query);

    const sortBy: string = req.query.sortBy as string;
    const direction: string = req.query.direction as string;
    const page: number = Number.parseInt(req.query.page as string);
    const perPage: number = Number.parseInt(req.query.perPage as string);

    const records = await prisma.login.findMany({
      skip: page * perPage,
      take: perPage,
      include: {
        account: true,
      },
      orderBy: ["createdAt"].includes(sortBy)
        ? [
            {
              [sortBy]: direction,
            },
          ]
        : ["email"].includes(sortBy)
        ? [
            {
              account: {
                [sortBy]: direction,
              },
            },
          ]
        : [],
    });

    const loginsCount = await prisma.login.count();
    if (records) {
      res.status(200).json({
        count: loginsCount,
        logins: records,
      });
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
