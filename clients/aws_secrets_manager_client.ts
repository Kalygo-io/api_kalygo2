import {
  SecretsManagerClient,
  CreateSecretCommand,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secretsManagerClient = new SecretsManagerClient({
  credentials: {
    accessKeyId: process.env.AWS_SECRETS_MANAGER_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRETS_MANAGER_SECRET_KEY!,
  },
  region: process.env.AWS_REGION,
});

export { secretsManagerClient, CreateSecretCommand, GetSecretValueCommand };
