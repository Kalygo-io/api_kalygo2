import prisma from "@db/prisma_client";
import pick from "lodash.pick";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";

export async function getAccountWithAccessGroups(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET account-with-access-groups");

    // fetch account by email
    let account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
      include: {
        AccessGroups: true,
      },
    });

    let publicAccessGroup = await prisma.accessGroup.findFirstOrThrow({
      where: {
        // @ts-ignore
        id: 1,
        name: "Public",
      },
    });

    console.log("testing...");

    res.status(200).json({
      ...pick(account, ["email", "firstName", "lastName"]),
      accessGroups: [publicAccessGroup, ...get(account, "AccessGroups", [])],
    });
  } catch (e) {
    console.log("ERROR in getAccountWithAccessGroups", e);

    next(e);
  }
}
