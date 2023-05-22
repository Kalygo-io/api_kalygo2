export function generatePasswordUpdated_SES_Config(email: string) {
  return {
    Destination: {
      CcAddresses: [],
      ToAddresses: [email],
    },
    Source: "Kalygo <noreply@kalygo.io>",
    Template: "CMD_GENERIC_EMAIL",
    TemplateData: `
              { 
                  \"SUBJECT\":\"Password Updated\", 
                  \"MESSAGE_AS_TEXT\":\"Password Updated\",
                  \"GREETING\":\"\",
                  \"MESSAGE\":\"Your password was recently updated. If this was not you please reach out to support@kalygo.io immediately.\",
                  \"ENDING\":\"\"
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
