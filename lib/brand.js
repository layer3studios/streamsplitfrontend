module.exports = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || 'StreamSplit',
  slug: process.env.NEXT_PUBLIC_BRAND_SLUG || 'streamsplit',
  favicon: '/favicon.ico',
  defaultLanguage: 'en',
  seo: {
    title: process.env.NEXT_PUBLIC_BRAND_NAME || 'StreamSplit',
    description: 'StreamSplit',
    keywords: 'streamsplit',
    ogImage: '/og-image.png',
  },
};
