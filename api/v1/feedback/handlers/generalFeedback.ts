import { Request, Response, NextFunction } from "express";
import prisma from "@db/prisma_client";

export async function generalFeedback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { feedback } = req.body;

    const count = await prisma.feedback.count();

    if (count > 100) {
      throw new Error("RATE_LIMIT");
    }

    const result = await prisma.feedback.create({
      data: {
        feedback,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
