'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, ChevronRight } from 'lucide-react';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import Footer from '../components/layout/Footer';
import AuthModal from '../components/ui/AuthModal';
import { MotionPage } from '../components/ui/Motion';
import { Container, SectionHeader, Divider } from '../components/ui/Layout';
import { GridSkeleton } from '../components/ui/Skeleton';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';
import api from '../lib/api';
const BRAND = require('../lib/brand');

export default function HomePage() {
  const { isAuthenticated } = useStore();
  const [brands, setBrands] = useState([]);
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [brandsRes, groupsRes, catsRes] = await Promise.all([
        api.getBrands({ limit: 6 }),
        api.getPublicGroups(1),
        api.getCategories(),
      ]);
      if (brandsRes.success) setBrands(brandsRes.data?.brands || brandsRes.data || []);
      if (groupsRes.success) setGroups((groupsRes.data?.groups || groupsRes.data || []).slice(0, 6));
      if (catsRes.success) setCategories(catsRes.data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <Header /><AuthModal />
      <MotionPage>

        {/* ═══ HERO ═══ */}
        <section className="pt-28 pb-16 md:pt-36 md:pb-24">
          <Container className="text-center">
            <p className="text-meta mb-4">TRUSTED BY THOUSANDS</p>
            <h1 className="text-display-huge max-w-4xl mx-auto">
              Premium subscriptions,{' '}
              <span className="italic text-[var(--accent)]">split</span> & shared
            </h1>
            <p className="text-caption mt-6 max-w-md mx-auto text-base">
              Join groups, share costs, and enjoy premium services at a fraction of the price.
            </p>
            <div className="flex items-center justify-center gap-3 mt-8">
              <Link href="/explore" className="btn-primary">
                Start Saving <ArrowRight className="w-4 h-4" />
              </Link>
              {!isAuthenticated && (
                <Link href="/join" className="btn-secondary">
                  Join via Invite
                </Link>
              )}
            </div>
          </Container>
        </section>

        <Container><Divider /></Container>

        {/* ═══ SECTION 1: CATEGORIES ═══ */}
        <section className="py-[var(--section-gap)]">
          <Container>
            <SectionHeader meta="01 / EXPLORE" title="Browse Categories" subtitle="Find the perfect subscription for you" />
            <div className="flex flex-wrap justify-center gap-2 mt-10">
              {categories.length > 0 ? categories.map(cat => (
                <Link
                  key={cat._id || cat.name}
                  href={`/explore?category=${cat.slug || cat.name}`}
                  className="badge hover:border-[var(--border2)] transition-colors"
                >
                  {cat.name}
                </Link>
              )) : (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton w-20 h-7 rounded-full" />
                ))
              )}
            </div>
          </Container>
        </section>

        <Container><Divider /></Container>

        {/* ═══ SECTION 2: FEATURED BRANDS ═══ */}
        <section className="py-[var(--section-gap)]">
          <Container>
            <SectionHeader meta="02 / POPULAR" title="Featured Brands" subtitle="Top-rated services loved by our community" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
              {loading ? (
                <GridSkeleton count={6} />
              ) : brands.length > 0 ? brands.map(brand => (
                <Link
                  key={brand._id}
                  href={`/explore/${brand.slug}`}
                  className="paper-card p-5 group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center shrink-0">
                      <span className="font-serif text-sm text-[var(--text)]">
                        {(brand.name || 'B').charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-heading text-sm truncate group-hover:text-[var(--accent)] transition-colors">{brand.name}</h3>
                      <p className="text-meta text-[10px]">{brand.category?.name || 'Subscription'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-xs">
                      From {formatCurrency(brand.min_price || brand.starting_price || 0)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--muted)] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              )) : (
                <p className="text-caption col-span-full text-center py-8">No brands available yet.</p>
              )}
            </div>
          </Container>
        </section>

        <Container><Divider /></Container>

        {/* ═══ SECTION 3: PUBLIC GROUPS ═══ */}
        <section className="py-[var(--section-gap)]">
          <Container>
            <SectionHeader meta="03 / GROUPS" title="Shared Subscriptions" subtitle="Join a group and start saving today" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
              {loading ? (
                <GridSkeleton count={6} />
              ) : groups.length > 0 ? groups.map(group => {
                const filled = group.member_count || 0;
                const total = group.max_members || group.plan_id?.max_members || 4;
                const pct = Math.min((filled / total) * 100, 100);
                return (
                  <div key={group._id} className="paper-card p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-[var(--muted)]" />
                      <h3 className="text-heading text-sm truncate">{group.name}</h3>
                    </div>
                    <p className="text-meta text-[10px] mb-3">{group.brand_id?.name || group.plan_id?.brand_name || 'Service'}</p>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-caption">{filled}/{total} seats</span>
                      <span className="font-medium text-[var(--text)]">
                        {formatCurrency(group.share_price || group.price_per_member || 0)}/seat
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-[var(--accent)] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <Link href={group.invite_code ? `/join/${group.invite_code}` : '/groups'}
                      className="btn-primary text-xs py-2 w-full text-center"
                    >
                      Join Group
                    </Link>
                  </div>
                );
              }) : (
                <p className="text-caption col-span-full text-center py-8">No groups available yet.</p>
              )}
            </div>
          </Container>
        </section>

        <Container><Divider /></Container>

        {/* ═══ DARK CTA BLOCKS ═══ */}
        <section className="py-[var(--section-gap)]">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/create-group" className="card-dark group">
                <p className="text-meta mb-3 text-[var(--ctaText)] opacity-60">FOR OWNERS</p>
                <h3 className="font-serif text-2xl md:text-3xl text-[var(--ctaText)] mb-2">Create a Group</h3>
                <p className="text-sm text-[var(--ctaText)] opacity-60 mb-6">
                  Share your subscription, earn back your costs.
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-[var(--ctaText)] font-medium group-hover:gap-3 transition-all">
                  Get Started <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
              <Link href="/join" className="card-dark group">
                <p className="text-meta mb-3 text-[var(--ctaText)] opacity-60">FOR MEMBERS</p>
                <h3 className="font-serif text-2xl md:text-3xl text-[var(--ctaText)] mb-2">Join with Code</h3>
                <p className="text-sm text-[var(--ctaText)] opacity-60 mb-6">
                  Got an invite? Enter your code and join instantly.
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-[var(--ctaText)] font-medium group-hover:gap-3 transition-all">
                  Enter Code <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </Container>
        </section>

        <Footer />
      </MotionPage>
      <MobileNav />
    </div>
  );
}
