import prisma from "@db/prisma_client";
import pick from "lodash.pick";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";
import {
  GetSecretValueCommand,
  secretsManagerClient,
} from "@/clients/aws_secrets_manager_client";

export async function getApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET /api/v1/get-api-key");

    const input = {
      SecretId: "random_id",
      VersionStage: "AWSCURRENT",
    };
    const command = new GetSecretValueCommand(input);
    const response = await secretsManagerClient.send(command);

    res.status(200).json(response);
  } catch (e) {
    console.log("ERROR in getApiKey", e);

    next(e);
  }
}
