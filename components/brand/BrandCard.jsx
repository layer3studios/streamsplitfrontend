'use client';
import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { formatCurrency } from '../../lib/utils';

/**
 * SubscriptionCard — A card specific to subscription sharing.
 * Shows: brand logo, category, starting price, groups/seats info, and CTAs.
 */
export function SubscriptionCard({ brand, feature = false, groups = [] }) {
    const href = `/explore/${brand.slug}`;
    const price = brand.min_price || brand.starting_price || 0;
    const brandGroups = groups.filter(g => g.brand_id === brand._id || g.brand_id?._id === brand._id);
    const seatsAvailable = brandGroups.reduce((sum, g) => sum + Math.max(0, (g.share_limit || 4) - (g.member_count || 0)), 0);
    const logoSize = feature ? 56 : 40;
    const categoryName = brand.category?.name || brand.category_id?.name || 'Subscription';

    return (
        <Link href={href} className={`subscription-card group relative block bg-[var(--surface)] border border-[var(--border)] overflow-hidden transition-all duration-200
      hover:-translate-y-[1px] hover:border-[var(--border2)] hover:shadow-md
      ${feature ? 'rounded-2xl p-6' : 'rounded-xl p-[18px]'}`}>

            {/* Paper-cut inset detail */}
            <span className="pointer-events-none absolute inset-[5px] border border-[var(--border)] rounded-[inherit] opacity-25" />

            <div className="relative flex items-start gap-4">
                {/* Logo */}
                <BrandLogo brand={brand} size={logoSize} feature={feature} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <h3 className={`font-medium text-[var(--text)] truncate transition-colors group-hover:text-[var(--accent)]
              ${feature ? 'text-lg' : 'text-sm'}`}>
                            {brand.name}
                        </h3>
                        {brand.brand_color && (
                            <span className="w-[5px] h-[5px] rounded-full shrink-0 mt-0.5" style={{ background: brand.brand_color }} />
                        )}
                    </div>

                    {/* Chip row */}
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] tracking-wider uppercase text-[var(--muted)] opacity-60">{categoryName}</span>
                        {brand.is_featured && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-medium">FEATURED</span>
                        )}
                    </div>

                    {feature && brand.description && (
                        <p className="text-[var(--muted)] text-sm mt-2 line-clamp-2">{brand.description}</p>
                    )}

                    {/* Price + groups + CTA row */}
                    <div className={`flex items-center justify-between ${feature ? 'mt-4' : 'mt-3'}`}>
                        <div className="flex items-center gap-3">
                            <span className="text-[var(--text)] font-medium text-sm">
                                From {formatCurrency(price)}
                            </span>
                            {seatsAvailable > 0 && (
                                <span className="flex items-center gap-1 text-[10px] text-[var(--accent)]">
                                    <Users className="w-3 h-3" /> {seatsAvailable} seats
                                </span>
                            )}
                        </div>
                        {feature ? (
                            <span className="text-xs font-medium text-[var(--text)] flex items-center gap-1 group-hover:gap-1.5 transition-all">
                                View Plans <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                        ) : (
                            <ChevronRight className="w-4 h-4 text-[var(--muted)] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        )}
                    </div>
                </div>
            </div>

            {/* Feature variant: mini plan preview */}
            {feature && brand.plans && brand.plans.length > 0 && (
                <div className="relative mt-4 pt-3 border-t border-[var(--border)]">
                    <div className="flex gap-2">
                        {brand.plans.slice(0, 3).map((plan, i) => (
                            <div key={i} className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                                <span className="text-[var(--muted)]">{plan.name}</span>
                                <span className="text-[var(--text)] font-medium ml-1">{formatCurrency(plan.price)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Link>
    );
}

/**
 * SubscriptionGrid — Editorial grid for subscription cards.
 * Row 1: feature card (7 cols) + normal (5 cols)
 * Row 2: 3 × 4 cols
 * Row 3+: 3-up, every 6th becomes wide
 */
export function SubscriptionGrid({ brands = [], groups = [] }) {
    if (brands.length === 0) {
        return <p className="text-[var(--muted)] text-center py-8 text-sm">No brands available yet.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            {brands.map((brand, i) => {
                // Row 1: feature + companion
                if (i === 0) {
                    return (
                        <div key={brand._id} className="col-span-1 sm:col-span-2 lg:col-span-7">
                            <SubscriptionCard brand={brand} feature groups={groups} />
                        </div>
                    );
                }
                if (i === 1) {
                    return (
                        <div key={brand._id} className="col-span-1 sm:col-span-1 lg:col-span-5">
                            <SubscriptionCard brand={brand} groups={groups} />
                        </div>
                    );
                }

                // Every 6th card after row 1 becomes wide
                const adjustedIdx = i - 2;
                const isWide = adjustedIdx >= 0 && adjustedIdx % 6 === 5;

                return (
                    <div key={brand._id}
                        className={isWide
                            ? 'col-span-1 sm:col-span-2 lg:col-span-6'
                            : 'col-span-1 sm:col-span-1 lg:col-span-4'
                        }>
                        <SubscriptionCard brand={brand} feature={isWide} groups={groups} />
                    </div>
                );
            })}
        </div>
    );
}
