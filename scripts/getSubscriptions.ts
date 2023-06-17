import "dotenv/config";
import { stripe } from "@/clients/stripe_client";

async function main() {
  console.log("main");
  const subscriptions = await stripe.subscriptions.list({ limit: 3 });
  console.log("subscriptions", subscriptions);
}

main();
