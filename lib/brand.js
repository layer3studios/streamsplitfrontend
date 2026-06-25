module.exports = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || 'StreamSplit',
  slug: process.env.NEXT_PUBLIC_BRAND_SLUG || 'streamsplit',
  domain: process.env.NEXT_PUBLIC_DOMAIN || 'streamsplit.app',
  favicon: '/favicon.ico',
  defaultLanguage: 'en',
  tagline: 'Split subscriptions, save money.',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@streamsplit.app',
  seo: {
    title: process.env.NEXT_PUBLIC_BRAND_NAME || 'StreamSplit',
    description: 'Split subscription costs with friends and family.',
    keywords: 'subscription sharing, split, streaming',
    ogImage: '/og-image.png',
  },
  auth: {
    otpLength: 6,
  },
  currency: {
    symbol: '₹',
  },
  wallet: {
    minTopup: 100,
    maxTopup: 10000,
  },
};
