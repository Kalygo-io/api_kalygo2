import { sesClient } from "@/clients/ses_client";
import { stripe } from "@/clients/stripe_client";
import prisma from "@/db/prisma_client";
import { customRequestJobComplete_SES_Config } from "@/emails/v2/customRequestJobComplete";
import { summaryJobComplete_SES_Config } from "@/emails/v2/summaryJobComplete";
import { p } from "@/utils/p";
import { sleep } from "@/utils/sleep";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";

export async function checkout(
  inputTokens: number,
  outputTokens: number,
  modelPricing: {
    markUp: number;
    input: {
      perTokens: number;
      rate: number;
    };
    output: {
      perTokens: number;
      rate: number;
    };
  },
  account: any,
  callerEmail: string,
  customRequestV3RecordId: number,
  locale: string
) {
  p("*** CHECKOUT ***");
  p("inputTokens", inputTokens);
  p("outputTokens", outputTokens);
  let _3rdPartyCharges = 0;
  _3rdPartyCharges +=
    (inputTokens / modelPricing.input.perTokens) * modelPricing.input.rate; // ie: OpenAI input token rate for API
  _3rdPartyCharges +=
    (outputTokens / modelPricing.output.perTokens) * modelPricing.output.rate; // ie: OpenAI output token rate for API
  p("_3rdPartyCharges", _3rdPartyCharges);
  let amountToChargeCaller =
    (_3rdPartyCharges * 1.029 + 0.3) * modelPricing.markUp; // Stripe charges 2.9% + 30¢ to run the card
  // prettier-ignore
  amountToChargeCaller = amountToChargeCaller < 0.5 ? 0.5 : amountToChargeCaller; // Stripe has a minimum charge of 50¢ USD
  p("amountToChargeCaller", amountToChargeCaller); // for console debugging
  const customRequestCredits = account?.customRequestCredits?.amount;
  if (customRequestCredits && customRequestCredits > 0) {
    p("paid for with a free CustomRequest credit...");
    await prisma.customRequestCredits.updateMany({
      where: {
        accountId: account.id,
      },
      data: {
        amount: customRequestCredits - 1,
      },
    });
  }
  await prisma.openAiCharges.create({
    data: {
      accountId: account.id,
      amount: _3rdPartyCharges,
    },
  });
  // -v-v- SEND AN EMAIL NOTIFICATION -v-v-
  p("send email notification...");
  try {
    const emailConfig = customRequestJobComplete_SES_Config(
      callerEmail,
      `${process.env.FRONTEND_HOSTNAME}/dashboard/custom-request-v3-result?custom-request-v3-id=${customRequestV3RecordId}`,
      locale
    );
    await sesClient.send(new SendTemplatedEmailCommand(emailConfig));
    p("email sent");
  } catch (e) {}
}
