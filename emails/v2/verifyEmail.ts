const TEMPLATE = `BRANDED_HEADER_AND_MAIN_AND_FOOTER`;

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
    Template: TEMPLATE,
    TemplateData: `{
        \"SUBJECT"\: \"${req.t("emails:signup.subject")}\",
        \"MESSAGE_AS_TEXT\": \"${req.t("emails:signup.message-as-text")}\",
        \"EMAIL_PREVIEW_TEXT\": \"${req.t("emails:signup.message-as-text")}\",
        \"HEADER_LOGO_ONCLICK_URL\":\"https://kalygo.io\",
        \"HEADER_LOGO_IMAGE\":\"https://kalygo.io/kalygo_new_logo-192x192.png\",
        \"HEADER_TEXT\":\"${req.t("emails:signup.subject")}\",
        \"MAIN_SECTION_TEXT\":\"${req.t(
          "emails:signup.click-the-button-below"
        )}\",
        \"CTA_URL\":\"${VERIFY_LINK}\",
        \"CTA_TEXT\":\"${req.t("emails:signup.click-to-verify")}\",
        \"FOOTER_TEXT_TITLE\":\"${req.t("emails:signup.need-help")}\",
        \"FOOTER_CTA_URL\":\"https://kalygo.io\",
        \"FOOTER_CTA_TEXT":\"${req.t("emails:signup.contact-support")}\"
        }`,
    ReplyToAddresses: ["noreply@kalygo.io"],
    ConfigurationSetName: "kalygo_config_set",
    Tags: [
      {
        Name: "BatchId",
        Value: "Kalygo",
      },
    ],
  };
}
