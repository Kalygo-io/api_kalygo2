import express, { Request, Response, NextFunction } from "express";

import prisma from "@db/prisma_client";
import argon2 from "argon2";
import { v4 } from "uuid";

export async function signUp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    // hash password and store in db
    const passwordHash = await argon2.hash(password);
    const emailVerificationToken = v4();

    const result = await prisma.account.create({
      data: {
        email,
        passwordHash,
        emailVerificationToken,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
