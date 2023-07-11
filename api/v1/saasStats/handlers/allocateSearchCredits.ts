import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function allocateSearchCredits(
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
        const searchCredits = await prisma.vectorSearchCredits.findUnique({ where: { accountId: user.id } });
        if (!searchCredits) {
            res.status(404).send();
            return;
        }
        const addedSearchCredits = await prisma.vectorSearchCredits.update({
            where: { id: searchCredits.id },
            data: { amount: { increment: Number(amount) } },
        });

        res.status(200).json({ message: 'Credits allocated!', addedSearchCredits });
    } catch (e) {
        next(e);
    }
}