import { Request, Response, NextFunction } from "express";
import { jobQueue } from "@/clients/bull_client";
import { QueueJobTypes } from "@/types/JobTypes";
import prisma from "@/db/prisma_client";
import { Account } from "@prisma/client";

export async function deleteContextDocument(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("DELETE delete-context-document");
    // console.log("req.file", req.file);
    // console.log("req.body", req.body);

    await prisma.file.deleteMany({
      where: {
        id: req.body.contextDocumentId,
        accountContextId: req.body.accountId,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
