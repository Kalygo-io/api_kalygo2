import { funStationaryTheme_SES_Config } from "@/emails/v2/funStationaryThemedEmailTemplate";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "@/clients/ses_client";

export async function sendEmailJobLogic(
  params: {
    recipientEmail: string;
    locale: string;
    campaign: string;
    subject: string;
    emailPreviewText: string;
    logoOnclickUrl: string;
    logoImageUrl: string;
    greeting: string;
    paragraphs: Record<string, string>;
    ending: string;
    endingSignature: string;
  },
  job: any,
  done: (err?: Error | null, result?: any) => void
) {
  try {
    console.log("processing sendEmailJobLogic with params...", params);
    const {
      recipientEmail,
      locale,
      campaign,
      subject,
      emailPreviewText,
      logoOnclickUrl,
      logoImageUrl,
      greeting,
      paragraphs,
      ending,
      endingSignature,
    } = params;

    if (
      !recipientEmail ||
      !locale ||
      !campaign ||
      !subject ||
      !emailPreviewText ||
      !logoOnclickUrl ||
      !logoImageUrl ||
      !greeting ||
      !paragraphs ||
      !ending ||
      !endingSignature
    ) {
      done(new Error("Invalid Data"));
      return;
    }

    const emailConfig = funStationaryTheme_SES_Config(
      campaign,
      [recipientEmail],
      subject,
      "messageAsText",
      emailPreviewText,
      logoOnclickUrl,
      logoImageUrl,
      greeting,
      paragraphs,
      ending,
      endingSignature
    );
    await sesClient.send(new SendTemplatedEmailCommand(emailConfig));

    done(null, {});
  } catch (e: any) {
    done(new Error(e ? e.message : "Something went wrong"));
  }
}
