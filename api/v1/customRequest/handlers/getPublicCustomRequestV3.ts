import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function getPublicCustomRequestV3(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET getPublicCustomRequestV3");

    // const account = await prisma.account.findFirst({
    //   where: {
    //     // @ts-ignore
    //     email: req.user.email,
    //   },
    // });
    // console.log("account", account);
    // console.log("req.params.id", req.params.id);

    const customRequestV3 = await prisma.customRequestV3.findFirst({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        Ratings: true,
        CustomRequestV3sAndAccessGroups: {
          include: {
            accessGroup: true,
          },
        },
      },
    });

    console.log("customRequestV3", customRequestV3);

    if (customRequestV3) {
      res.status(200).json(customRequestV3);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
