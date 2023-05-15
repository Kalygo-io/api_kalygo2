export function generateResetPasswordConfigSes(
  email: string,
  RESET_LINK: string
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
                \"SUBJECT\":\"Reset Password\", 
                \"MESSAGE_AS_TEXT\":\"Reset Password\",
                \"GREETING\":\"Password Reset Requested\",
                \"MESSAGE\":\"Reset Link: ${RESET_LINK}\",
                \"ENDING\":\"Good Luck!\"
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
