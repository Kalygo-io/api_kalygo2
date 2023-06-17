import "dotenv/config";
import { stripe } from "@/clients/stripe_client";

async function main() {
  const price = await stripe.prices.create({
    unit_amount: 999,
    currency: "usd",
    recurring: { interval: "month" },
    product: "prod_O5vOF7lwVB9NtW",
  });

  console.log("price", price); // prod_O5vOF7lwVB9NtW

  // price_1NJjZ4BProJYO6FDp0fjKLku
}

main();
