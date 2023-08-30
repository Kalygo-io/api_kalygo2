import en_emailsTranslations from "@/locales/en/emails.json";
import es_emailsTranslations from "@/locales/es/emails.json";
import fr_emailsTranslations from "@/locales/fr/emails.json";
import pt_emailsTranslations from "@/locales/pt/emails.json";

const TEMPLATE = `BRANDED_JOB_COMPLETE`;

export function summaryJobComplete_SES_Config(
  email: string,
  SUMMARY_LINK: string,
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
    Template: TEMPLATE,
    TemplateData: `{
        \"SUBJECT"\: \"${translations.summaryJobComplete.subject}\",
        \"MESSAGE_AS_TEXT\": \"${translations.summaryJobComplete["message-as-text"]} ${SUMMARY_LINK}\",
        \"EMAIL_PREVIEW_TEXT\": \"${translations.summaryJobComplete.email_preview}\",
        \"TITLE\":\"${translations.summaryJobComplete.subject}\",
        \"CTA_TEXT\":\"${translations.summaryJobComplete["view-summary"]}\",
        \"CTA_URL\":\"${SUMMARY_LINK}\"  
    }`,
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
