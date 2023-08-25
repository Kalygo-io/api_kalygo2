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
        AccountsAndAccessGroups: true,
      },
    });

    console.log(
      "AccountsAndAccessGroups",
      get(account, "AccountsAndAccessGroups", [])
    );
    console.log("* Account *", account);

    console.log("--- --- ---");

    // const accountsAndAccessGroups =
    //   await prisma.accountsAndAccessGroups.findMany({});
    // console.log("accountsAndAccessGroups", accountsAndAccessGroups);

    if (
      get(account, "AccountsAndAccessGroups", []).find(
        (value: any) => value.accessGroupId === 1
      )
    ) {
      console.log("Public AccessGroup exists");

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
      console.log("Public AccessGroup does NOT exist");

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
    console.log("ERROR in getPublicSummaryV2", e);

    next(e);
  }
}
