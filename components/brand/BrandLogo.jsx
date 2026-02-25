'use client';
import BrandMark from './BrandMark';

/**
 * BrandLogo — Renders a real SVG logo from URL, with BrandMark fallback.
 *
 * Props:
 *   brand  - { name, slug, logo_url, logo_dark_url, brand_color }
 *   size   - pixel size (default 48)
 *   feature - larger variant
 *   className
 */
export default function BrandLogo({ brand = {}, size = 48, feature = false, className = '' }) {
    const s = feature ? Math.max(size, 72) : size;
    const logoUrl = brand.logo_url || '';

    // No logo? Fallback to generated BrandMark
    if (!logoUrl) {
        return <BrandMark slug={brand.slug} name={brand.name} size={s} feature={feature} className={className} />;
    }

    // Render the logo inside a subtle badge container
    const pad = feature ? 14 : 10;
    const containerSize = s + pad * 2;

    return (
        <div
            className={`shrink-0 flex items-center justify-center rounded-[14px] border border-[var(--border)] ${className}`}
            style={{
                width: containerSize,
                height: containerSize,
                background: brand.brand_color ? `${brand.brand_color}08` : 'transparent',
            }}
        >
            <img
                src={logoUrl}
                alt={`${brand.name} logo`}
                width={s}
                height={s}
                className="object-contain"
                style={{ width: s, height: s }}
                loading="lazy"
            />
        </div>
    );
}
