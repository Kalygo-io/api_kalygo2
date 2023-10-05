import { stripe } from "@/clients/stripe_client";
import prisma from "@/db/prisma_client";
import { p } from "@/utils/p";
import { sleep } from "@/utils/sleep";

export async function checkout(
  //   inputTokens: number,
  //   outputTokens: number,
  //   modelPricing: {
  //     markUp: number;
  //     input: {
  //       perTokens: number;
  //       rate: number;
  //     };
  //     output: {
  //       perTokens: number;
  //       rate: number;
  //     };
  //   },
  account: any
  //   currency: "usd" = "usd",
  //   checkoutDescription: string,
  //   stripeCustomerId: string
) {
  //   p("inputTokens", inputTokens);
  //   p("outputTokens", outputTokens);
  //   let _3rdPartyCharges = 0;
  //   _3rdPartyCharges +=
  //     (inputTokens / modelPricing.input.perTokens) * modelPricing.input.rate; // ie: OpenAI input token rate for API
  //   _3rdPartyCharges +=
  //     (outputTokens / modelPricing.output.perTokens) * modelPricing.output.rate; // ie: OpenAI output token rate for API
  //   // -v-v- SUMMARY OF 3rd PARTY CHARGES -v-v-
  //   p("_3rdPartyCharges", _3rdPartyCharges);
  //   // -v-v- MARKUP THE 3rd PARTY CHARGES -v-v-
  //   let amountToChargeCaller =
  //     (_3rdPartyCharges * 1.029 + 0.3) * modelPricing.markUp; // Stripe charges 2.9% + 30¢ to run the card
  //   // prettier-ignore
  //   amountToChargeCaller = amountToChargeCaller < 0.5 ? 0.5 : amountToChargeCaller; // Stripe has a minimum charge of 50¢ USD
  //   p("amountToChargeCaller", amountToChargeCaller); // for console debugging
  const vectorSearchCredits = account?.VectorSearchCredits?.amount;
  if (vectorSearchCredits && vectorSearchCredits > 0) {
    p("paid for with free credit...");
    await prisma.vectorSearchCredits.updateMany({
      where: {
        accountId: account.id,
      },
      data: {
        amount: vectorSearchCredits - 1,
      },
    });
  }

  //   await prisma.openAiCharges.create({
  //     data: {
  //       accountId: account.id,
  //       amount: _3rdPartyCharges, // TODO - refine this - here we are tracking the OpenAI API charges
  //     },
  //   });
}
