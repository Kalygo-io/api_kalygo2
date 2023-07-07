export function generateResetPassword_SES_Config(
  email: string,
  RESET_LINK: string,
  token: string,
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
        \"SUBJECT\":\"${req.t("emails:resetPassword.subject")}\", 
        \"MESSAGE_AS_TEXT\":\"${req.t(
          "emails:resetPassword.message-as-text"
        )}\",
        \"GREETING\":\"${req.t("emails:resetPassword.greeting", {
          token: token,
        })}\",
        \"MESSAGE\":\"${req.t("emails:resetPassword.message", {
          reset_link: RESET_LINK,
        })}\",
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
