import prisma from "@db/prisma_client";
import pick from "lodash.pick";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";

export async function getContextDocuments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET /acount/get-context-documents/:accountId");

    // fetch account by email
    let account = await prisma.account.findFirst({
      where: {
        id: parseInt(req.params.accountId),
      },
      include: {
        AccountContext: true,
      },
    });

    // let publicAccessGroup = await prisma.accessGroup.findFirstOrThrow({
    //   where: {
    //     // @ts-ignore
    //     id: 1,
    //     name: "Public",
    //   },
    // });

    console.log("testing...");

    res.status(200).json({
      ...pick(account, ["AccountContext"]),
    });
  } catch (e) {
    console.log("ERROR in getContextDocuments", e);

    next(e);
  }
}
