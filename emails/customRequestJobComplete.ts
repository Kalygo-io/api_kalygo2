import en_emailsTranslations from "../locales/en/emails.json";
import es_emailsTranslations from "../locales/es/emails.json";
import fr_emailsTranslations from "../locales/fr/emails.json";
import pt_emailsTranslations from "../locales/pt/emails.json";

export function customRequestJobComplete_SES_Config(
  email: string,
  CUSTOM_REQUEST_LINK: string,
  language: any
) {
  let translations;
  switch (language) {
    case "en":
      translations = en_emailsTranslations;
      break;
    case "es":
      translations = es_emailsTranslations;
      break;
    case "fr":
      translations = fr_emailsTranslations;
      break;
    case "pt":
      translations = pt_emailsTranslations;
      break;
    default:
      translations = en_emailsTranslations;
  }

  return {
    Destination: {
      CcAddresses: [],
      ToAddresses: [email],
    },
    Source: "Kalygo <noreply@kalygo.io>",
    Template: "CMD_GENERIC_EMAIL",
    TemplateData: `
      { 
        \"SUBJECT\":\"${
          translations.customRequestJobComplete.subject
          // true
          // req.t("emails:summaryJobComplete.subject")
        }\", 
        \"MESSAGE_AS_TEXT\":\"${
          translations.customRequestJobComplete["message-as-text"]
          // true
          // req.t("emails:summaryJobComplete.message-as-text")
        }\",
        \"GREETING\":\"${
          translations.customRequestJobComplete.greeting
          // true
          // req.t("emails:summaryJobComplete.greeting")
        }\",
        \"MESSAGE\":\"${
          `${translations.customRequestJobComplete.message} ${CUSTOM_REQUEST_LINK}`
          // true
          // req.t("emails:summaryJobComplete.message", {
          //   summary_link: SUMMARY_LINK,
          // })
        }\",
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
