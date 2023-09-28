const TEMPLATE = `FUN_STATIONARY_THEME`;

import { SendEmailCommandInput } from "@aws-sdk/client-ses";

export function funStationaryTheme_SES_Config(
  campaign: string,
  recipients: string[],
  subject: string,
  messageAsText: string,
  emailPreviewText: string,
  logoOnclickUrl: string,
  logoImageUrl: string,
  greeting: string,
  paragraphs: Record<string, string>,
  ending: string,
  endingSignature: string
) {
  return {
    Destination: {
      CcAddresses: [],
      //   ToAddresses: [
      //     "Tad Duval <tad@cmdlabs.io>",
      //     "Tad Duval <ceemmmdee@gmail.com>",
      //   ],
      ToAddresses: recipients,
      //   ToAddresses: [
      //     "Chris Daniels <chris@theshrimpsociety.com>",
      //     "Aaron Chavez <aaron@argentstrategies.com>",
      //     "Tad Duval <tad@cmdlabs.io>",
      //   ],
      //   ToAddresses: [
      //     "Ana Caka <ac7601@bard.edu>",
      //     "joseph.12082@gmail.com",
      //     "Lauren Seff <laurenseff@gmail.com>",
      //     "Matt Hughes <matt@matthughes.link>",
      //     "Sarah Murphy <sarahmurphy005@icloud.com>",
      //     "team@kalygo.io",
      //     "tad@cmdlabs.io",
      //   ],
      //   ToAddresses: [
      //     "Jesse Hollander <jesse@aiforge.org>",
      //     "Kevin Jackson <kevin@aiforge.org>",
      //     "Miguel Diaz <miguel@aiforge.org>",
      //     "Patrick Thompson <patrick@aiforge.org>",
      //   ],
      //   ReplyToAddresses: ["team@kalygo.io"],
    },
    Source: "Kalygo <team@kalygo.io>",
    Template: TEMPLATE,
    // \"MESSAGE_AS_TEXT\": \"${messageAsText}\",
    TemplateData: `{
        \"SUBJECT"\: \"${subject}\",
        ${messageAsText ? `\"MESSAGE_AS_TEXT\":\"${messageAsText}\",` : ""}
        \"EMAIL_PREVIEW_TEXT\": \"${emailPreviewText}\",
        \"LOGO_ONCLICK_URL\": \"${logoOnclickUrl}\",
        \"LOGO_IMAGE_URL\": \"${logoImageUrl}\",
        \"GREETING\":\"${greeting}\",
        ${paragraphs["1"] ? `\"PARAGRAPH_1\":\"${paragraphs["1"]}\",` : ""}
        ${paragraphs["2"] ? `\"PARAGRAPH_2\":\"${paragraphs["2"]}\",` : ""}
        ${paragraphs["3"] ? `\"PARAGRAPH_3\":\"${paragraphs["3"]}\",` : ""}
        ${paragraphs["4"] ? `\"PARAGRAPH_4\":\"${paragraphs["4"]}\",` : ""}
        ${paragraphs["5"] ? `\"PARAGRAPH_5\":\"${paragraphs["5"]}\",` : ""}
        ${paragraphs["6"] ? `\"PARAGRAPH_6\":\"${paragraphs["6"]}\",` : ""}
        \"ENDING\":\"${ending}\",
        \"ENDING_SIGNATURE\":\"${endingSignature}\"
}`,
    ReplyToAddresses: ["support@kalygo.io"],
    ConfigurationSetName: "kalygo_config_set",
    Tags: [
      {
        Name: "BatchId",
        Value: "Kalygo",
      },
      {
        Name: "Campaign",
        Value: campaign,
      },
    ],
  };
}
