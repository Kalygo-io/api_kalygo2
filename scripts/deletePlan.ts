import "dotenv/config";
import { stripe } from "@/clients/stripe_client";

async function main() {
  console.log("main");
  const plan = await stripe.plans.del("price_1NJjaFBProJYO6FDnsqiJ17x");
  console.log("plan", plan);
}

main();
