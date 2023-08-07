import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function allocateCustomRequestCredits(
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
        const customRequestCredits = await prisma.customRequestCredits.findUnique({ where: { accountId: user.id } });
        if (!customRequestCredits) {
            res.status(404).send();
            return;
        }
        const addedCustomRequestCredits = await prisma.customRequestCredits.update({
            where: { id: customRequestCredits.id },
            data: { amount: { increment: Number(amount) } },
        });

        res.status(200).json({ message: 'Credits allocated!', addedCustomRequestCredits });
    } catch (e) {
        next(e);
    }
}
