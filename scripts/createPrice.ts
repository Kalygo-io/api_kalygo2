import "dotenv/config";
import { stripe } from "@/clients/stripe_client";

async function main() {
  const price = await stripe.prices.create({
    unit_amount: 999,
    currency: "usd",
    recurring: { interval: "month" },
    product: "prod_O6LxkI90QuQXAl",
  });

  console.log("price", price); // prod_O5vOF7lwVB9NtW
}

main();
