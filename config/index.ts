/*
reference OpenAI documentation that defines pricing and rate limits...

https://openai.com/pricing
https://platform.openai.com/account/rate-limits
https://platform.openai.com/docs/guides/rate-limits/overview
*/

export default {
  stripe: {
    products: {
      kalygoPremiumPlan: {
        id: process.env.STRIPE_PREMIUM_PLAN_PRODUCT_ID,
        price: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID,
      },
    },
  },
  limit: {
    maxAccounts: 400,
  },
  tpmBuffer: 200,
  queue: {
    timeout: 1000 * 60 * 60, // 1hr
  },
  models: {
    "gpt-3.5-turbo": {
      minimumCreditsRequired: 10,
      context: 4000,
      tpm: 90000,
      rpm: -1, // TODO
      pricing: {
        markUp: 1.5,
        input: {
          rate: 0.0015, // USD
          perTokens: 1000,
        },
        output: {
          rate: 0.002, // USD
          perTokens: 1000,
        },
      },
    },
    "gpt-4": {
      minimumCreditsRequired: 80,
      context: 8000,
      tpm: 10000,
      rpm: -1, // TODO
      pricing: {
        markUp: 1.5,
        input: {
          rate: 0.03, // USD
          perTokens: 1000,
        },
        output: {
          rate: 0.06, // USD
          perTokens: 1000,
        },
      },
    },
    "text-embedding-ada-002": {
      minimumCreditsRequired: 10,
      context: 0,
      tpm: 1000000,
      rpm: 3000,
      pricing: {
        markUp: 1.4,
        usage: {
          rate: 0.0001, // USD
          perTokens: 1000,
        },
      },
    },
  },
};
