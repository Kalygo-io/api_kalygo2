import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import pick from "lodash.pick";
import { jobQueue } from "@/clients/bull_client";
import { Request, Response, NextFunction } from "express";

import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { funStationaryTheme_SES_Config } from "@emails/v2/funStationaryThemedEmailTemplate";
import { sesClient } from "@/clients/ses_client";
import { QueueJobTypes } from "@/types/JobTypes";

export async function sendEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST send-email");

    const {
      scheduledAtUnixMilliseconds,
      campaign,
      recipientEmails,
      subject,
      emailPreviewText,
      logoOnclickUrl,
      logoImageUrl,
      greeting,
      paragraphs,
      ending,
      endingSignature,
    } = req.body;

    console.log("scheduledAtUnixMilliseconds", scheduledAtUnixMilliseconds);

    console.log(
      "Is this email scheduled for the future?",
      new Date().getTime() < scheduledAtUnixMilliseconds
    );

    let locale: string = req?.i18n?.language?.substring(0, 2) || "en";

    if (new Date().getTime() < scheduledAtUnixMilliseconds) {
      for (let i = 0; i < recipientEmails.length; i++) {
        jobQueue.add(
          {
            jobType: QueueJobTypes.SendEmail,
            params: {
              locale,
              campaign,
              recipientEmail: recipientEmails[i],
              subject,
              emailPreviewText,
              logoOnclickUrl,
              logoImageUrl,
              greeting,
              paragraphs,
              ending,
              endingSignature,
            },
          },
          {
            timeout: 1000 * 60 * 60, // 1 hour before being marked as timed out
            delay: scheduledAtUnixMilliseconds - new Date().getTime(),
          }
        );
      }

      res.status(200).send();
    } else {
      let messageAsText = `${greeting}\\n\\n`;
      for (let i = 1; i < 11; i++) {
        console.log("paragraphs[i]", paragraphs[i]);

        if (!paragraphs[i]) {
          delete paragraphs[i];
        } else {
          messageAsText += `${paragraphs[i]}\\n\\n`;
        }
      }
      messageAsText += `${ending}\\n${endingSignature}`;
      console.log("messageAsText", messageAsText);
      console.log("*** paragraphs ***", paragraphs);
      for (let i = 0; i < recipientEmails.length; i++) {
        const emailConfig = funStationaryTheme_SES_Config(
          campaign,
          // @ts-ignore
          [recipientEmails[i]],
          subject,
          messageAsText,
          emailPreviewText,
          logoOnclickUrl,
          logoImageUrl,
          greeting,
          paragraphs,
          ending,
          endingSignature
        );
        await sesClient.send(new SendTemplatedEmailCommand(emailConfig));
      }

      res.status(200).send();
    }
  } catch (e) {
    next(e);
  }
}
