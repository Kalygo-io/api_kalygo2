import { Request, Response, NextFunction } from "express";
// import prisma from "@db/prisma_client";
import {
  CreateSecretCommand,
  secretsManagerClient,
} from "@/clients/aws_secrets_manager_client";
import { v4 } from "uuid";
import { SupportedApiKeys } from "@prisma/client";
import prisma from "@/db/prisma_client";
// import { builtInputJsonForCreateSecretCommand } from "./buildInputJsonForCreateSecretCommand";
import {
  DeleteSecretCommand,
  UpdateSecretCommand,
} from "@aws-sdk/client-secrets-manager";

export async function deleteApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("DELETE delete-api-key", req.body);
    let { secretId } = req.body;

    console.log("secretId", secretId);

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    const awsSecret = await prisma.awsSecretsManagerApiKey.findFirst({
      where: {
        secretId: secretId,
        accountId: account?.id,
      },
    });

    if (awsSecret) {
      await prisma.awsSecretsManagerApiKey.deleteMany({
        where: {
          secretId: secretId,
          accountId: account?.id,
        },
      });

      const command = new DeleteSecretCommand({
        SecretId: awsSecret.secretId,
      });
      await secretsManagerClient.send(command);

      res.status(200).send();
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
