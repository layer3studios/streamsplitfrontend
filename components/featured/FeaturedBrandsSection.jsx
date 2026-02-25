'use client';
import FeaturedBrandCard from './FeaturedBrandCard';
import { SectionHeader } from '../ui/Layout';

/**
 * FeaturedBrandsSection — Signature Editorial Stack layout.
 *
 * Desktop (>=1024px):
 *   Row A: Primary feature (col 1–7) + two stacked Minis (col 8–12)
 *   Row B: up to 4 Standard cards (col-span-3 each)
 *   Row C: remaining as wide pairs (col-span-6)
 *
 * Tablet (>=768px, <1024px):
 *   Feature full width, then 2-column grid
 *
 * Mobile (<768px):
 *   Feature full width, horizontal scroll minis, then stacked standards
 */
export default function FeaturedBrandsSection({ brands = [], groups = [] }) {
    if (brands.length === 0) return null;

    // Partition: [0] = primary, [1,2] = minis, [3..6] = standard row, [7+] = wide pairs
    const primary = brands[0];
    const minis = brands.slice(1, 3);
    const standardRow = brands.slice(3, 7);
    const wideRow = brands.slice(7);

    return (
        <section className="py-[var(--section-gap)]">
            <div className="max-w-[var(--page-max)] mx-auto px-[var(--page-px)]">
                <SectionHeader meta="02 / POPULAR" title="Featured Brands" subtitle="Top-rated services loved by our community" />

                <div className="mt-10 space-y-4">

                    {/* ─── Row A: Feature + Stacked Minis ─── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Primary feature card */}
                        <div className="lg:col-span-7">
                            <FeaturedBrandCard brand={primary} variant="primary" groups={groups} />
                        </div>

                        {/* Stacked minis (desktop: right column, mobile: horizontal scroll) */}
                        {minis.length > 0 && (
                            <>
                                {/* Desktop: stacked vertically */}
                                <div className="hidden lg:flex lg:col-span-5 flex-col gap-4">
                                    {minis.map(b => (
                                        <FeaturedBrandCard key={b._id} brand={b} variant="mini" groups={groups} />
                                    ))}
                                </div>

                                {/* Mobile/Tablet: horizontal snap scroll */}
                                <div className="lg:hidden col-span-1 -mx-[var(--page-px)] px-[var(--page-px)] overflow-x-auto scrollbar-hide">
                                    <div className="flex gap-3 min-w-max pr-[var(--page-px)]">
                                        {minis.map(b => (
                                            <div key={b._id} className="w-[280px] shrink-0">
                                                <FeaturedBrandCard brand={b} variant="mini" groups={groups} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ─── Row B: Standard 4-up grid ─── */}
                    {standardRow.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {standardRow.map(b => (
                                <FeaturedBrandCard key={b._id} brand={b} variant="standard" groups={groups} />
                            ))}
                        </div>
                    )}

                    {/* ─── Row C: Wide pairs ─── */}
                    {wideRow.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {wideRow.map(b => (
                                <FeaturedBrandCard key={b._id} brand={b} variant="standard" groups={groups} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
