import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";
// import { stripe } from "@/clients/stripe_client";
// import prisma from "@db/prisma_client";
// import pick from "lodash.pick";

export async function deleteAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("deleteAccessGroup");

    const { id } = req.params;

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    await prisma.accessGroup.deleteMany({
      where: {
        id: parseInt(id),
        createdById: account?.id!,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
