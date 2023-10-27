import { SupportedApiKeys } from "@prisma/client";

export function builtInputJsonForCreateSecretCommand(
  apiKeyOwner: string,
  apiKeyId: string,
  apiKeyType: SupportedApiKeys,
  apiKeyValue: string
) {
  return {
    Name: apiKeyId,
    Description: `${apiKeyType} for ${apiKeyOwner}`,
    SecretString: apiKeyValue,
    Tags: [
      {
        Key: "account",
        Value: apiKeyOwner,
      },
      {
        Key: "apiKeyType",
        Value: apiKeyType,
      },
    ],
  };
}
