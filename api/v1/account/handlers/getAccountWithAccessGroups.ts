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
        CreatedAccessGroups: {
          include: {
            accessGroup: true,
          },
        },
      },
    });

    console.log("testing...");

    // IF the caller is a member of the 'Public' AccessGroup as all accounts should be
    // THEN return all the callers AccessGroups with the 'Public' one included
    if (
      get(account, "CreatedAccessGroups", []).find(
        (value: any) => value.accessGroupId === 1
      )
    ) {
      res.status(200).json({
        ...pick(account, ["email", "firstName", "lastName"]),
        accessGroups: [...get(account, "CreatedAccessGroups", [])],
      });
    }
    // IF the caller is NOT a member of the 'Public' AccessGroup
    // THEN add them and refetch their account with the AccessGroups they belong to with the 'Public' one now included
    else {
      // adding the caller to the 'Public' AccessGroup
      await prisma.accountsAndAccessGroups.create({
        data: {
          accountId: account?.id!,
          accessGroupId: 1,
          // @ts-ignore
          createdById: account?.id!,
        },
      });
      // and fetching caller's account again with all the AccessGroups that are either platform defaults or that they have created (aka own)
      account = await prisma.account.findFirst({
        where: {
          // @ts-ignore
          email: req.user.email,
        },
        include: {
          CreatedAccessGroups: {
            include: {
              accessGroup: true,
            },
          },
        },
      });

      res.status(200).json({
        ...pick(account, ["email", "firstName", "lastName"]),
        accessGroups: [...get(account, "CreatedAccessGroups", [])],
      });
    }
  } catch (e) {
    console.log("ERROR in getAccountWithAccessGroups", e);

    next(e);
  }
}
