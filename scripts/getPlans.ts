import "dotenv/config";
import { stripe } from "@/clients/stripe_client";

async function main() {
  console.log("main");
  const plans = await stripe.plans.list({ limit: 3 });
  console.log("plans", plans);
}

main();
