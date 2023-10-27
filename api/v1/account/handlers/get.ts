import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import pick from "lodash.pick";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";
import { s3Client, getSignedUrl, GetObjectCommand } from "@/clients/s3_client";

export async function getAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET account");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
      include: {
        SummaryCredits: true,
        VectorSearchCredits: true,
        CustomRequestCredits: true,
        UsageCredits: true,
        ProfilePicture: true,
        Files: true,
        AwsSecretsManagerApiKey: true,
      },
    });

    const customerSearchResults = await stripe.customers.search({
      query: `email:\'${account?.email}\'`,
      limit: 1,
    });

    let subscriptions = {
      data: [],
    };

    if (!customerSearchResults.data[0]) {
      let url;
      if (account?.ProfilePicture?.key) {
        const command = new GetObjectCommand({
          Bucket: process.env.S3_DOCUMENTS_BUCKET,
          Key: account?.ProfilePicture?.key,
        });
        // @ts-ignore
        url = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });
      }

      res.status(200).json({
        ...pick(account, [
          "id",
          "email",
          "firstName",
          "lastName",
          "subscriptionPlan",
          "Files",
          "AwsSecretsManagerApiKey",
          "referralCode",
        ]),
        subscriptions: subscriptions,
        stripeDefaultSource: null,
        summaryCredits: get(account, "SummaryCredits.amount", 0),
        vectorSearchCredits: get(account, "VectorSearchCredits.amount", 0),
        customRequestCredits: get(account, "CustomRequestCredits.amount", 0),
        usageCredits: get(account, "UsageCredits.amount"),
        profilePicture: null,
      });
    } else {
      subscriptions = await stripe.subscriptions.list({
        customer: customerSearchResults.data[0].id,
      });

      let url;
      if (account?.ProfilePicture?.key) {
        const command = new GetObjectCommand({
          Bucket: process.env.S3_DOCUMENTS_BUCKET,
          Key: account?.ProfilePicture?.key,
        });
        // @ts-ignore
        url = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });
      }

      res.status(200).json({
        ...pick(account, [
          "id",
          "email",
          "firstName",
          "lastName",
          "subscriptionPlan",
          "Files",
          "AwsSecretsManagerApiKey",
          "referralCode",
        ]),
        subscriptions: subscriptions,
        stripeDefaultSource: customerSearchResults.data[0]?.default_source,
        summaryCredits: get(account, "SummaryCredits.amount", 0),
        vectorSearchCredits: get(account, "VectorSearchCredits.amount", 0),
        customRequestCredits: get(account, "CustomRequestCredits.amount", 0),
        usageCredits: get(account, "UsageCredits.amount"),
        profilePicture: url,
      });
    }
  } catch (e) {
    next(e);
  }
}
