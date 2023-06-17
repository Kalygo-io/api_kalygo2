import "dotenv/config";
import { stripe } from "@/clients/stripe_client";

async function main() {
  const subscription = await stripe.subscriptions.create({
    // name: planName,
    customer: "cus_NzWoyDZlzYumr3",
    items: [{ price: "price_1NJjZ4BProJYO6FDp0fjKLku" }],
    // trial_end: 1610403705, // UNIX timestamp of when first default payment source will be charged
    // trial_period_days: 30 // UNIX timestamp of when first default payment source will be charged
  });
  console.log("subscription", subscription); // prod_O5vJPAJqU617nh
}

main();
