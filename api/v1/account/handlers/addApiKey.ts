import { Request, Response, NextFunction } from "express";
// import prisma from "@db/prisma_client";
import {
  CreateSecretCommand,
  secretsManagerClient,
} from "@/clients/aws_secrets_manager_client";

export async function addApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST addApiKey", req.body);

    const input = {
      Name: "random_id",
      Description:
        "Storing an arbitrary 3rd party API key for account: a@a.com",
      SecretString: JSON.stringify(req.body),
      Tags: [
        {
          Key: "account",
          // @ts-ignore
          Value: "req.user.email",
        },
      ],
    };
    const command = new CreateSecretCommand(input);
    const response = await secretsManagerClient.send(command);
    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
