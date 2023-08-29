export function generatePasswordUpdated_SES_Config(email: string, req: any) {
  return {
    Destination: {
      CcAddresses: [],
      ToAddresses: [email],
    },
    Source: "Kalygo <noreply@kalygo.io>",
    Template: "CMD_GENERIC_EMAIL",
    TemplateData: `
      { 
        \"SUBJECT\":\"${req.t("emails:passwordUpdated.subject")}\", 
        \"MESSAGE_AS_TEXT\":\"${req.t(
          "emails:passwordUpdated.message-as-text"
        )}\",
        \"GREETING\":\"${req.t("emails:passwordUpdated.greeting")}\",
        \"MESSAGE\":\"${req.t("emails:passwordUpdated.message")}\",
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
