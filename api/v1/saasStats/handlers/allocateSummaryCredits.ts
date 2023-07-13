import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function allocateSummaryCredits(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { email, amount } = req.body;
        if (amount < 1) {
            res.status(400).send({ message: "Amount must be greater than 0" });
            return;
        }
        const user = await prisma.account.findUnique({ where: { email } });
        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }
        const summaryCredits = await prisma.summaryCredits.findUnique({ where: { accountId: user.id } });
        if (!summaryCredits) {
            res.status(404).send();
            return;
        }
        const addedSummaryCredits = await prisma.summaryCredits.update({
            where: { id: summaryCredits.id },
            data: { amount: { increment: Number(amount) } },
        });

        res.status(200).json({ message: 'Credits allocated!', addedSummaryCredits });
    } catch (e) {
        next(e);
    }
}
