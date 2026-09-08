import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  cancelSubscription,
} from '@lemonsqueezy/lemonsqueezy.js';

const apiKey = process.env.LEMONSQUEEZY_API_KEY;

if (apiKey) {
  lemonSqueezySetup({
    apiKey,
    onError: (error) => console.error('[Lemon Squeezy] Setup error:', error),
  });
}

export const LEMONSQUEEZY_CONFIG = {
  storeId: process.env.LEMONSQUEEZY_STORE_ID,
  webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
  variants: {
    monthly: process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID,
    yearly: process.env.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID,
  },
};

export { createCheckout, getSubscription, cancelSubscription };
