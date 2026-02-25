'use client';
import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';
import BrandLogo from '../brand/BrandLogo';
import { formatCurrency } from '../../lib/utils';

/**
 * FeaturedBrandCard — Three variants for the editorial Featured Brands section.
 *
 * variant:
 *   "primary"  — Large feature card (logo plaque 92px, description, CTA)
 *   "mini"     — Compact row card (logo 56px, name + price inline)
 *   "standard" — Medium density grid card (logo 64px, name, category, price)
 */
export default function FeaturedBrandCard({ brand, variant = 'standard', groups = [] }) {
    const href = `/explore/${brand.slug}`;
    const price = brand.min_price || brand.starting_price || 0;
    const categoryName = brand.category?.name || brand.category_id?.name || 'Subscription';
    const brandGroups = groups.filter(g => g.brand_id === brand._id || g.brand_id?._id === brand._id);
    const seatsAvailable = brandGroups.reduce((sum, g) => sum + Math.max(0, (g.share_limit || 4) - (g.member_count || 0)), 0);

    // ─── PRIMARY ────────────────────────────────────
    if (variant === 'primary') {
        return (
            <Link href={href} className="group block bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-[1px] hover:border-[var(--border2)] hover:shadow-md h-full">
                <div className="grid grid-cols-[auto_1fr] gap-5 p-5 md:p-6 h-full items-start">
                    {/* Logo plaque */}
                    <div
                        className="w-[72px] h-[72px] md:w-[92px] md:h-[92px] rounded-[18px] border border-[var(--border)] flex items-center justify-center shrink-0"
                        style={{ background: brand.brand_color ? `${brand.brand_color}12` : 'var(--bg)' }}
                    >
                        <BrandLogo brand={brand} size={48} feature className="!border-0 !rounded-none !p-0 !bg-transparent" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-between min-h-[100px] md:min-h-[120px] min-w-0">
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-serif text-lg md:text-xl text-[var(--text)] truncate group-hover:text-[var(--accent)] transition-colors">
                                    {brand.name}
                                </h3>
                                {brand.brand_color && (
                                    <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: brand.brand_color }} />
                                )}
                            </div>
                            <p className="text-[9px] tracking-[0.12em] uppercase text-[var(--muted)] mt-1">{categoryName}</p>
                            <p className="text-[var(--muted)] text-sm mt-2 line-clamp-1">
                                {brand.description || 'Top-rated subscription'}
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
                            <div className="flex items-center gap-3">
                                <span className="text-[var(--text)] font-medium text-sm">From {formatCurrency(price)}</span>
                                {seatsAvailable > 0 && (
                                    <span className="flex items-center gap-1 text-[10px] text-[var(--accent)]">
                                        <Users className="w-3 h-3" /> {seatsAvailable} seats
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-medium text-[var(--text)] flex items-center gap-1 group-hover:gap-1.5 transition-all">
                                View Plans <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // ─── MINI ───────────────────────────────────────
    if (variant === 'mini') {
        return (
            <Link href={href} className="group flex items-center gap-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 transition-all duration-200 hover:-translate-y-[0.5px] hover:border-[var(--border2)] hover:shadow-sm h-full">
                {/* Logo plaque */}
                <div
                    className="w-[48px] h-[48px] rounded-[12px] border border-[var(--border)] flex items-center justify-center shrink-0"
                    style={{ background: brand.brand_color ? `${brand.brand_color}10` : 'var(--bg)' }}
                >
                    <BrandLogo brand={brand} size={28} className="!border-0 !rounded-none !p-0 !bg-transparent" />
                </div>

                {/* Name + price */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                        <h4 className="text-sm font-medium text-[var(--text)] truncate group-hover:text-[var(--accent)] transition-colors">{brand.name}</h4>
                        {brand.brand_color && (
                            <span className="w-[4px] h-[4px] rounded-full shrink-0" style={{ background: brand.brand_color }} />
                        )}
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5">From {formatCurrency(price)}</p>
                </div>

                {/* Seats or arrow */}
                {seatsAvailable > 0 ? (
                    <span className="flex items-center gap-0.5 text-[9px] text-[var(--accent)] shrink-0 font-medium">
                        <Users className="w-3 h-3" /> {seatsAvailable}
                    </span>
                ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)] opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                )}
            </Link>
        );
    }

    // ─── STANDARD (default) ─────────────────────────
    return (
        <Link href={href} className="group block bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-[1px] hover:border-[var(--border2)] hover:shadow-md h-full">
            <div className="grid grid-cols-[auto_1fr] gap-3.5 p-4 md:p-5 h-full items-center">
                {/* Logo plaque */}
                <div
                    className="w-[52px] h-[52px] md:w-[64px] md:h-[64px] rounded-[14px] border border-[var(--border)] flex items-center justify-center shrink-0"
                    style={{ background: brand.brand_color ? `${brand.brand_color}10` : 'var(--bg)' }}
                >
                    <BrandLogo brand={brand} size={32} className="!border-0 !rounded-none !p-0 !bg-transparent" />
                </div>

                {/* Content */}
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-medium text-[var(--text)] truncate group-hover:text-[var(--accent)] transition-colors">{brand.name}</h4>
                        {brand.brand_color && (
                            <span className="w-[4px] h-[4px] rounded-full shrink-0" style={{ background: brand.brand_color }} />
                        )}
                    </div>
                    <p className="text-[9px] tracking-[0.12em] uppercase text-[var(--muted)] mt-0.5">{categoryName}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-[var(--muted)]">From {formatCurrency(price)}</span>
                        {seatsAvailable > 0 && (
                            <span className="flex items-center gap-0.5 text-[9px] text-[var(--accent)] font-medium">
                                <Users className="w-2.5 h-2.5" /> {seatsAvailable}
                            </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)] opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ml-auto shrink-0" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
