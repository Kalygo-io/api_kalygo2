export function vectorSearchJobComplete_SES_Config(
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
                    \"SUBJECT\":\"Your vector search results have been generated\", 
                    \"MESSAGE_AS_TEXT\":\"Your vector search results have been generated\",
                    \"GREETING\":\"Your vector search results have been generated\",
                    \"MESSAGE\":\"View results: ${SUMMARY_LINK}\",
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
