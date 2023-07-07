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
        const totalOpenAiCharges = await prisma.openAiCharges.aggregate({
          _sum: {
              amount: true,
          },
      });
      const totalAiCharges = totalOpenAiCharges._sum.amount || 0;
      const averageOpenAiChargesPerUser = totalAccounts > 0 ? totalAiCharges / totalAccounts : 0;
        
        res.status(200).json({totalAccounts, paidAccountsCount, verifiedAccountsCount, totalSummaries, averageSummariesPerUser, totalOpenAiCharges, averageOpenAiChargesPerUser});
    } catch (e) {
      next(e);
    }
} 
