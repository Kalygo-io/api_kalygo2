export function purchasedCreditsEmail_SES_Config(
  email: string,
  credits: number,
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
          \"SUBJECT\":\"${req.t("emails:purchasedCredits.subject")}\", 
          \"MESSAGE_AS_TEXT\":\"${req.t(
            "emails:purchasedCredits.message-as-text"
          )}\",
          \"GREETING\":\"${req.t("emails:purchasedCredits.greeting", {
            usage_credits: credits,
          })}\",
          \"MESSAGE\":\"${req.t("emails:purchasedCredits.message")}\",
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
