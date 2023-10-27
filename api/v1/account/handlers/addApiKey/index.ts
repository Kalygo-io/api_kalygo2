import { Request, Response, NextFunction } from "express";
// import prisma from "@db/prisma_client";
import {
  CreateSecretCommand,
  secretsManagerClient,
} from "@/clients/aws_secrets_manager_client";
import { v4 } from "uuid";
import { SupportedApiKeys } from "@prisma/client";
import prisma from "@/db/prisma_client";
import { builtInputJsonForCreateSecretCommand } from "./buildInputJsonForCreateSecretCommand";
import { UpdateSecretCommand } from "@aws-sdk/client-secrets-manager";

export async function addApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST add-api-key", req.body);
    let accountApiKeys = req.body as {
      type: SupportedApiKeys;
      value: string;
    }[];
    accountApiKeys = accountApiKeys.filter((i) => {
      return i.value;
    });
    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });
    for (let a of accountApiKeys) {
      const referenceToSecret = await prisma.awsSecretsManagerApiKey.findFirst({
        where: {
          accountId: account?.id!,
          type: a.type,
        },
      });
      if (referenceToSecret && account && a) {
        console.log("referenceToSecret && account", a);

        await prisma.awsSecretsManagerApiKey.updateMany({
          where: {
            accountId: account?.id!,
            type: a.type,
          },
          data: {
            preview: `${a.value.slice(0, 4)}...`,
          },
        });

        const command = new UpdateSecretCommand({
          SecretId: referenceToSecret.secretId,
          SecretString: a.value,
        });
        await secretsManagerClient.send(command);
      } else {
        console.log("referenceToSecret && account", a);
        // Create the API key in AWS Secrets Manager, and then store a reference to it in the DB
        const apiKeyId = v4();
        // prettier-ignore
        // @ts-ignore
        const command = new CreateSecretCommand(builtInputJsonForCreateSecretCommand(req.user.email, apiKeyId, a.type, a.value));
        const response = await secretsManagerClient.send(command);
        await prisma.awsSecretsManagerApiKey.create({
          data: {
            accountId: account?.id!,
            secretId: response.Name!,
            type: a.type,
            preview: `${a.value.slice(0, 4)}...`,
          },
        });
      }
    }

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
