export function generateVerifyEmail_SES_Config(
  email: string,
  VERIFY_LINK: string,
  req: any
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
        \"SUBJECT\":\"${req.t("emails:signup.subject")}\", 
        \"MESSAGE_AS_TEXT\":\"${req.t("emails:signup.message-as-text")}\",
        \"GREETING\":\"${req.t("emails:signup.greeting")}\",
        \"MESSAGE\":\"${req.t("emails:signup.message", {
          verification_link: VERIFY_LINK,
        })}\",
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
