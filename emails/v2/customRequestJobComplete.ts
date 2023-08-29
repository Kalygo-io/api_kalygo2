import en_emailsTranslations from "@/locales/en/emails.json";
import es_emailsTranslations from "@/locales/es/emails.json";
import fr_emailsTranslations from "@/locales/fr/emails.json";
import pt_emailsTranslations from "@/locales/pt/emails.json";

const TEMPLATE = `BRANDED_JOB_COMPLETE`;

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
    Template: TEMPLATE,
    TemplateData: `{
        \"SUBJECT"\: \"${translations.customRequestJobComplete.subject}\",
        \"MESSAGE_AS_TEXT\": \"${translations.customRequestJobComplete.message} ${CUSTOM_REQUEST_LINK}\",
        \"EMAIL_PREVIEW_TEXT\": \"${translations.customRequestJobComplete.email_preview}\",
        \"TITLE\":\"${translations.customRequestJobComplete.subject}\",
        \"CTA_TEXT\":\"${translations.customRequestJobComplete.view_custom_request}\",
        \"CTA_URL\":\"${CUSTOM_REQUEST_LINK}\"  
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
