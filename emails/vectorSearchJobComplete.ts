import en_emailsTranslations from "../locales/en/emails.json";
import es_emailsTranslations from "../locales/es/emails.json";
import fr_emailsTranslations from "../locales/fr/emails.json";
import pt_emailsTranslations from "../locales/pt/emails.json";

export function vectorSearchJobComplete_SES_Config(
  email: string,
  RESULTS_LINK: string,
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

  console.log("Vector Search Complete email");
  console.log(translations);

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
        translations.vectorSearchJobComplete.subject
        // true
        // req.t("emails:summaryJobComplete.subject")
      }\", 
      \"MESSAGE_AS_TEXT\":\"${
        translations.vectorSearchJobComplete["message-as-text"]
        // true
        // req.t("emails:summaryJobComplete.message-as-text")
      }\",
      \"GREETING\":\"${
        translations.vectorSearchJobComplete.greeting
        // true
        // req.t("emails:summaryJobComplete.greeting")
      }\",
      \"MESSAGE\":\"${
        `${translations.vectorSearchJobComplete.message} ${RESULTS_LINK}`
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
