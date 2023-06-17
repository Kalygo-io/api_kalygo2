import "dotenv/config";
import { stripe } from "@/clients/stripe_client";

async function main() {
  const planName = "Kalygo Premium Plan";
  console.log(`create ${planName}`);
  const product = await stripe.products.create({
    name: planName,
  });
  console.log("product", product); // prod_O5vJPAJqU617nh
}

main();
