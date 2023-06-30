import { stripe } from "@/clients/stripe_client";
import prisma from "@/db/prisma_client";
import axios from "axios";
import { Request, Response, NextFunction } from "express";

export async function joinMailingList(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("joinMailingList");

    axios.post(
      "https://hooks.zapier.com/hooks/catch/13166575/3dzuxn1/",
      {
        email: req.body.email,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
