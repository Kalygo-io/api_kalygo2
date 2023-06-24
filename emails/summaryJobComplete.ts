export function summaryJobComplete_SES_Config(
  email: string,
  SUMMARY_LINK: string
) {
  return {
    Destination: {
      CcAddresses: [],
      ToAddresses: [email],
    },
    Source: "Kalygo <noreply@kalygo.io>",
    Template: "CMD_GENERIC_EMAIL",
    TemplateData: `
              { 
                  \"SUBJECT\":\"Your summary has been generated\", 
                  \"MESSAGE_AS_TEXT\":\"Your summary has been generated\",
                  \"GREETING\":\"Your summary has been generated\",
                  \"MESSAGE\":\"View summary: ${SUMMARY_LINK}\",
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
