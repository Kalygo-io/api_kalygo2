import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function getSaasStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
    try {
        const totalAccounts = await prisma.account.count();
        const paidAccountsCount = await prisma.account.count({
          where: {
            subscriptionPlan: { in: ['STANDARD', 'PREMIUM'] },
          },
        });
        const verifiedAccountsCount = await prisma.account.count({
          where: {
            emailVerified: true,
          },
        });
        const totalSummaries = await prisma.summary.count();
        const averageSummariesPerUser = totalSummaries / totalAccounts;
        const totalSearches = await prisma.vectorSearch.count();
        const averageSearchesPerUser = totalSearches / totalAccounts;
        const totalCustomRequests = await prisma.customRequest.count();
        const averageCustomRequests = totalCustomRequests / totalAccounts;
        const totalOpenAiCharges = await prisma.openAiCharges.aggregate({
          _sum: {
              amount: true,
          },
      });
      const totalAiCharges = totalOpenAiCharges._sum.amount || 0;
      const averageOpenAiChargesPerUser = totalAiCharges / totalAccounts;
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const loginsInLast30DaysData = await prisma.login.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          },
        },
        select: {
          accountId: true
        }
      });
    const monthlyActiveUsers = new Set(loginsInLast30DaysData.map(login => login.accountId)).size;
        
      res.status(200).json({totalAccounts, paidAccountsCount, verifiedAccountsCount, totalSummaries, averageSummariesPerUser, totalOpenAiCharges, averageOpenAiChargesPerUser, monthlyActiveUsers, totalSearches, averageSearchesPerUser, totalCustomRequests, averageCustomRequests});
    } catch (e) {
      next(e);
    }
  }
