# Creating subscription plans in Stripe

## High live flow for supporting subscriptions

1. Create a product - https://stripe.com/docs/api/products/create

Check out `createProduct.ts`

```.js
const product = await stripe.products.create({
  name: 'Kalygo Premium Plan',
});
```

2. Create a price - https://stripe.com/docs/api/prices/create

Check out `createPrice.ts`

```.js
const price = await stripe.prices.create({
  unit_amount: 999,
  currency: 'usd',
  recurring: {interval: 'month'},
  product: 'prod_O5bJSANoWC4Zwn',
});
```

3. Create a subscription - https://stripe.com/docs/api/subscriptions/create

```.js
const subscription = await stripe.subscriptions.create({
  customer: 'cus_9s6XFG2Qq6Fe7v',
  items: [
    {price: 'price_1NJZQs2eZvKYlo2CkRNoAb14'},
  ],
});
```

## Create a product...

const prices = await stripe.prices.list({
  limit: 3,
});

## 

const price = await stripe.prices.create({
  unit_amount: 20000,
  currency: 'usd',
  recurring: {interval: 'month', },
  product: 'prod_O5bJSANoWC4Zwn',
});
