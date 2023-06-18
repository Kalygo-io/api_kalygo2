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
};
