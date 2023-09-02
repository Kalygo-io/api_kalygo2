import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import pick from "lodash.pick";
import { jobQueue } from "@/clients/bull_client";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";
import { QueueJobTypes } from "@/types/JobTypes";

import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { funStationaryTheme_SES_Config } from "@emails/v2/funStationaryThemedEmailTemplate";
import { sesClient } from "@/clients/ses_client";

export async function sendEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST send-email");

    const {
      recipientEmails,
      subject,
      messageAsText,
      emailPreviewText,
      logoOnclickUrl,
      logoImageUrl,
      greeting,
      paragraphs,
      ending,
      endingSignature,
    } = req.body;

    // let locale: string = req?.i18n?.language?.substring(0, 2) || "en";

    for (let i = 1; i < 11; i++) {
      console.log("paragraphs[i]", paragraphs[i]);

      if (!paragraphs[i]) {
        delete paragraphs[i];
      }
    }

    console.log("*** paragraphs ***", paragraphs);

    for (let i = 0; i < recipientEmails.length; i++) {
      const emailConfig = funStationaryTheme_SES_Config(
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
  } catch (e) {
    next(e);
  }
}
