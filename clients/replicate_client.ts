import Replicate from "replicate";

export const replicateClient = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});
