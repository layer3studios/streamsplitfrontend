'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Footer from '../../components/layout/Footer';
import AuthModal from '../../components/ui/AuthModal';
import { MotionPage } from '../../components/ui/Motion';
import { Container, SectionHeader, Divider } from '../../components/ui/Layout';
import { GridSkeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/utils';
import api from '../../lib/api';

export default function ExplorePage() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories().then(r => { if (r.success) setCategories(r.data || []); });
  }, []);

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
    <div className="min-h-screen">
      <Header /><AuthModal />
      <MotionPage>
        <section className="pt-28 pb-8 md:pt-36">
          <Container>
            <SectionHeader meta="MARKETPLACE" title="Explore" subtitle="Discover premium subscriptions at unbeatable prices" />
          </Container>
        </section>

        <Container><Divider /></Container>

        {/* Filters */}
        <section className="py-8">
          <Container>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="text"
                placeholder="Search brands..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input max-w-xs"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCat('')}
                  className={`badge ${!selectedCat ? 'badge-active' : ''}`}
                >All</button>
                {categories.map(cat => (
                  <button
                    key={cat._id || cat.name}
                    onClick={() => setSelectedCat(cat.slug || cat.name)}
                    className={`badge ${selectedCat === (cat.slug || cat.name) ? 'badge-active' : ''}`}
                  >{cat.name}</button>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Brand Grid */}
        <section className="pb-[var(--section-gap)]">
          <Container>
            {loading ? (
              <GridSkeleton count={6} />
            ) : brands.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {brands.map(brand => (
                  <Link key={brand._id} href={`/explore/${brand.slug}`} className="paper-card p-5 group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center shrink-0">
                        <span className="font-serif text-sm">{(brand.name || 'B').charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-heading text-sm truncate group-hover:text-[var(--accent)] transition-colors">{brand.name}</h3>
                        <p className="text-meta text-[10px]">{brand.category?.name || ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-caption text-xs">From {formatCurrency(brand.min_price || brand.starting_price || 0)}</span>
                      <ChevronRight className="w-4 h-4 text-[var(--muted)] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-caption text-center py-16">No brands found.</p>
            )}
          </Container>
        </section>

        <Footer />
      </MotionPage>
      <MobileNav />
    </div>
  );
}
