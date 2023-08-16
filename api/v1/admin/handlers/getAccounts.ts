import { stripe } from "@/clients/stripe_client";
import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";
import pick from "lodash.pick";

export async function getAccounts(
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

    const accounts = await prisma.account.findMany({
      skip: page * perPage,
      take: perPage,
      include: {
        Logins: true,
      },
      orderBy: ["email", "createdAt"].includes(sortBy)
        ? [
            {
              [sortBy]: direction,
            },
          ]
        : [],
    });

    const accountsCount = await prisma.account.count();

    if (accounts) {
      res.status(200).json({
        count: accountsCount,
        accounts: accounts,
      });
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
