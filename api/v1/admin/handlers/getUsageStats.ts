import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function getUsageStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const totalAccounts = await prisma.account.count();
    const paidAccountsCount = await prisma.account.count({
      where: {
        subscriptionPlan: { in: ["STANDARD", "PREMIUM"] },
      },
    });
    const verifiedAccountsCount = await prisma.account.count({
      where: {
        emailVerified: true,
      },
    });
    const totalSummariesV1 = await prisma.summary.count();
    const totalSummariesV2 = await prisma.summaryV2.count();
    const totalSearches = await prisma.vectorSearch.count();
    const totalCustomRequests = await prisma.customRequest.count();
    const totalOpenAiCharges = await prisma.openAiCharges.aggregate({
      _sum: {
        amount: true,
      },
    });

    // vvv in-app Ratings vvv
    const ratings = await prisma.rating.findMany();
    let sumRatings = 0;
    for (let i = 0; i < ratings.length; i++) {
      sumRatings += ratings[i].rating / ratings[i].ratingMax;
    }
    const averageRating = sumRatings / ratings.length;

    // vvv MAU vvv
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const loginsInLast30DaysData = await prisma.login.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        accountId: true,
      },
    });
    const monthlyActiveUsers = new Set(
      loginsInLast30DaysData.map((login) => login.accountId)
    ).size;

    res.status(200).json({
      totalAccounts,
      paidAccountsCount,
      verifiedAccountsCount,
      totalSummariesV1: totalSummariesV1,
      totalSummariesV2: totalSummariesV2,
      totalSummaries: totalSummariesV1 + totalSummariesV2,
      totalSearches,
      totalCustomRequests,
      totalOpenAiCharges,
      monthlyActiveUsers,
      averageRating,
    });
  } catch (e) {
    next(e);
  }
}
