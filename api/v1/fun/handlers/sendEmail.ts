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

    let locale: string = req?.i18n?.language?.substring(0, 2) || "en";

    // const emailConfig = funStationaryTheme_SES_Config(
    //   req.body.email,
    //   "Test",
    //   "Hello Tad",
    //   "Message",
    //   "Ending",
    //   locale
    // );
    // await sesClient.send(new SendTemplatedEmailCommand(emailConfig));

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
