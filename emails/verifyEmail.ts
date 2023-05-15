export function generateVerifyEmail_SES_Config(
  email: string,
  VERIFY_LINK: string
) {
  return {
    Destination: {
      CcAddresses: [],
      ToAddresses: [email],
    },
    Source: "Kalygo <admin@kalygo.io>",
    Template: "CMD_GENERIC_EMAIL",
    TemplateData: `
              { 
                  \"SUBJECT\":\"Verify Email\", 
                  \"MESSAGE_AS_TEXT\":\"Verify Email\",
                  \"GREETING\":\"Welcome to Kalygo\",
                  \"MESSAGE\":\"Verification Link: ${VERIFY_LINK}\",
                  \"ENDING\":\": )\"
              }
          `,
    ReplyToAddresses: ["no-reply@kalygo.io"],
    ConfigurationSetName: "kalygo_config_set",
    Tags: [
      {
        Name: "BatchId",
        Value: "Kalygo",
      },
    ],
  };
}
