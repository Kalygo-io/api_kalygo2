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
    maxAccounts: 300,
  },
  tpmBuffer: 100,
  models: {
    "gpt-3.5-turbo": {
      context: 4000,
      tpm: 90000,
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
      context: 8000,
      tpm: 10000,
      pricing: {
        markUp: 1.5,
        input: {
          rate: 0.03, // USD,
          perTokens: 1000,
        },
        output: {
          rate: 0.06, // USD,
          perTokens: 1000,
        },
      },
    },
  },
};
