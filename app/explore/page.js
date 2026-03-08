'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Users } from 'lucide-react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Footer from '../../components/layout/Footer';
import AuthModal from '../../components/ui/AuthModal';
import { MotionPage } from '../../components/ui/Motion';
import { Container, SectionHeader, Divider } from '../../components/ui/Layout';
import { GridSkeleton } from '../../components/ui/Skeleton';
import { SubscriptionCard, SubscriptionGrid } from '../../components/brand/BrandCard';
import { formatCurrency } from '../../lib/utils';
import api from '../../lib/api';

function ExploreContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('query') || '';
  const categoryParam = searchParams.get('category') || '';

  const [brands, setBrands] = useState([]);
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(categoryParam);
  const [search, setSearch] = useState(queryParam);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories().then(r => { if (r.success) setCategories(r.data || []); });
    api.getPublicGroups(1).then(r => { if (r.success) setGroups(r.data?.groups || r.data || []); });
  }, []);

  useEffect(() => {
    if (queryParam) setSearch(queryParam);
    if (categoryParam) setSelectedCat(categoryParam);
  }, [queryParam, categoryParam]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedCat) params.category = selectedCat;
    if (search) params.search = search;
    api.getBrands(params).then(r => {
      if (r.success) setBrands(r.data?.brands || r.data || []);
      setLoading(false);
    });
  }, [selectedCat, search]);

  return (
    <>
      <section className="pt-28 pb-8 md:pt-36">
        <Container>
          <SectionHeader meta="MARKETPLACE" title="Explore" subtitle="Discover premium subscriptions at unbeatable prices" />
        </Container>
      </section>

      <Container><Divider /></Container>

      {/* Filters */}
      <section className="py-8">
        <Container>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-auto">
              <input type="text" placeholder="Search brands..."
                value={search} onChange={e => setSearch(e.target.value)} autoFocus={!!queryParam}
                className="h-[38px] w-full sm:w-56 rounded-full bg-transparent border border-[var(--border)] pl-4 pr-4 text-[13px] text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition-all focus:border-[var(--border2)] focus:ring-2 focus:ring-[var(--accent)]/15"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedCat('')}
                className={`badge ${!selectedCat ? 'badge-active' : ''}`}>All</button>
              {categories.map(cat => (
                <button key={cat._id || cat.name}
                  onClick={() => setSelectedCat(cat.slug || cat.name)}
                  className={`badge ${selectedCat === (cat.slug || cat.name) ? 'badge-active' : ''}`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Subscription cards grid */}
      <section className="pb-16">
        <Container>
          {loading ? <GridSkeleton count={6} /> : <SubscriptionGrid brands={brands} groups={groups} />}
        </Container>
      </section>

      {/* Shared Subscriptions rail */}
      {groups.length > 0 && (
        <>
          <Container><Divider /></Container>
          <section className="py-[var(--section-gap)]">
            <Container>
              <SectionHeader meta="GROUPS" title="Shared Subscriptions" subtitle="Join a group to split costs and save" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
                {groups.slice(0, 6).map(group => {
                  const filled = group.member_count || 0;
                  const total = group.share_limit || 5;
                  const pct = Math.min((filled / total) * 100, 100);
                  return (
                    <div key={group._id} className="paper-card p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-[var(--muted)]" />
                        <h3 className="text-heading text-sm truncate">{group.name}</h3>
                      </div>
                      <p className="text-[9px] tracking-wider uppercase text-[var(--muted)] opacity-60 mb-3">
                        {group.brand_id?.name || 'Service'}
                      </p>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[var(--muted)]">{filled}/{total} seats</span>
                        <span className="font-medium text-[var(--text)]">{formatCurrency(group.share_price || 0)}/seat</span>
                      </div>
                      <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <Link href={group.invite_code ? `/join/${group.invite_code}` : '/groups'}
                        className="btn-primary text-xs py-2 w-full text-center">Join Group</Link>
                    </div>
                  );
                })}
              </div>
            </Container>
          </section>
        </>
      )}
    </>
  );
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen">
      <Header /><AuthModal />
      <MotionPage>
        <Suspense fallback={<Container className="pt-28"><GridSkeleton count={6} /></Container>}>
          <ExploreContent />
        </Suspense>
        <Footer />
      </MotionPage>
      <MobileNav />
    </div>
  );
}
