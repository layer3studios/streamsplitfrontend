'use client';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import MobileNav from '../../components/layout/MobileNav';
const BRAND = require('../../lib/brand');

// Blog posts are editorial content — no backend API needed.
// If a blog CMS is added later, these can be fetched from API.
const BLOG_POSTS = [
  { slug: 'save-on-ott', title: 'How to Save 80% on OTT Subscriptions', excerpt: 'Discover the smartest ways to split and save on Netflix, Hotstar, and more.', category: 'Tips', readTime: '3 min', date: 'Feb 24, 2026' },
  { slug: 'group-sharing-guide', title: `The Complete Guide to ${BRAND.name} Group Sharing`, excerpt: 'Everything you need to know about splitting subscriptions safely with groups.', category: 'Guide', readTime: '5 min', date: 'Feb 22, 2026' },
  { slug: 'youtube-premium-free', title: 'Get YouTube Premium at Lowest Price', excerpt: 'Step-by-step guide to getting YouTube Premium family plan through group sharing.', category: 'Tutorial', readTime: '4 min', date: 'Feb 20, 2026' },
  { slug: 'digital-payments-future', title: 'The Future of Digital Payments in India', excerpt: 'How UPI, AI, and digital wallets are transforming how we pay for subscriptions.', category: 'Finance', readTime: '6 min', date: 'Feb 18, 2026' },
  { slug: 'referral-codes', title: `How to Share Referral Codes in ${BRAND.name}`, excerpt: 'Earn wallet cashback by inviting friends to the platform.', category: 'Tips', readTime: '2 min', date: 'Feb 15, 2026' },
  { slug: 'netflix-price-increase', title: 'Netflix Price Increase 2026 – What You Need to Know', excerpt: 'Netflix raised prices again. Here is how group sharing can offset the increase.', category: 'News', readTime: '3 min', date: 'Feb 12, 2026' },
];

const catColors = {
  Tips: 'bg-green-500/10 text-green-400 border-green-500/20',
  Guide: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Tutorial: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Finance: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  News: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function BlogsPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-20 pb-24 md:pb-8 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-3xl text-[var(--text)] mb-2">{BRAND.name} Blog</h1>
            <p className="text-[var(--muted)]">Tips, guides, and news about saving on subscriptions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BLOG_POSTS.map((post) => (
              <article key={post.slug} className="card p-5 group">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catColors[post.category] || catColors.Tips}`}>
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1 text-[var(--muted)] text-xs">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </div>
                </div>

                <h2 className="font-heading font-bold text-[var(--text)] text-base mb-2 group-hover:text-brand-primary-light transition-colors">
                  {post.title}
                </h2>
                <p className="text-[var(--muted)] text-sm leading-relaxed mb-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)] text-xs">{post.date}</span>
                  <span className="text-brand-primary-light text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
