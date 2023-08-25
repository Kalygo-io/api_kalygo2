import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
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

    // @ts-ignore
    // console.log("req.user", req.user);

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
      include: {
        SummaryCredits: true,
        VectorSearchCredits: true,
        CustomRequestCredits: true,
        UsageCredits: true,
        AccessGroups: true,
      },
    });

    if (get(account, "AccessGroups", []).find((value) => value.id === 1)) {
      res.status(200).json({
        ...pick(account, [
          "email",
          "firstName",
          "lastName",
          "subscriptionPlan",
        ]),
        stripeDefaultSource: null,
        summaryCredits: get(account, "SummaryCredits.amount", 0),
        vectorSearchCredits: get(account, "VectorSearchCredits.amount", 0),
        customRequestCredits: get(account, "CustomRequestCredits.amount", 0),
        usageCredits: get(account, "UsageCredits.amount"),
        accessGroups: get(account, "AccessGroups"),
      });
    } else {
      await prisma.accountsAndAccessGroups.create({
        data: {
          accountId: account?.id!,
          accessGroupId: 1,
          // @ts-ignore
          createdBy: req.user.email,
        },
      });

      res.status(200).json({
        ...pick(account, [
          "email",

          "firstName",
          "lastName",
          "subscriptionPlan",
        ]),
        stripeDefaultSource: null,
        summaryCredits: get(account, "SummaryCredits.amount", 0),
        vectorSearchCredits: get(account, "VectorSearchCredits.amount", 0),
        customRequestCredits: get(account, "CustomRequestCredits.amount", 0),
        usageCredits: get(account, "UsageCredits.amount"),
        accessGroups: get(account, "AccessGroups"),
      });
    }
  } catch (e) {
    next(e);
  }
}
