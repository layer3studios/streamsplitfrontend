'use client';
import { colorsFromSlug, markTypeFromSlug } from '../../lib/brandMarks';

/**
 * BrandMark — Renders a bold, minimal, colored SVG mark per brand slug.
 * Size: 56–72px desktop, 48px mobile (controlled via `size` prop or className).
 *
 * Props:
 *   slug     - brand slug string
 *   name     - brand name (for monogram fallback)
 *   size     - pixel size (default 56)
 *   feature  - if true, renders at larger "feature" size (80+)
 *   className - additional classes
 */
export default function BrandMark({ slug = '', name = '', size = 56, feature = false, className = '' }) {
    const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
    const colors = colorsFromSlug(slug, isDark);
    const type = markTypeFromSlug(slug);
    const s = feature ? Math.max(size, 80) : size;
    const letter = (name || slug || 'B').charAt(0).toUpperCase();
    const half = s / 2;

    const marks = [
        // 0: Circle with monogram
        () => (
            <>
                <circle cx={half} cy={half} r={half - 2} fill={colors.primary} />
                <text x={half} y={half} dominantBaseline="central" textAnchor="middle"
                    fontSize={s * 0.42} fontWeight="700" fontFamily="'Instrument Serif', Georgia, serif" fill="#fff">{letter}</text>
            </>
        ),
        // 1: Rounded square with diagonal
        () => (
            <>
                <rect x="2" y="2" width={s - 4} height={s - 4} rx={s * 0.22} fill={colors.primary} />
                <line x1={s * 0.25} y1={s * 0.75} x2={s * 0.75} y2={s * 0.25} stroke={colors.secondary} strokeWidth={s * 0.06} strokeLinecap="round" opacity="0.5" />
                <text x={half} y={half} dominantBaseline="central" textAnchor="middle"
                    fontSize={s * 0.4} fontWeight="700" fontFamily="'Instrument Serif', Georgia, serif" fill="#fff">{letter}</text>
            </>
        ),
        // 2: Diamond
        () => {
            const pts = `${half},3 ${s - 3},${half} ${half},${s - 3} 3,${half}`;
            return (
                <>
                    <polygon points={pts} fill={colors.primary} />
                    <text x={half} y={half} dominantBaseline="central" textAnchor="middle"
                        fontSize={s * 0.35} fontWeight="700" fontFamily="'Instrument Serif', Georgia, serif" fill="#fff">{letter}</text>
                </>
            );
        },
        // 3: Circle + inner ring
        () => (
            <>
                <circle cx={half} cy={half} r={half - 2} fill={colors.primary} />
                <circle cx={half} cy={half} r={half * 0.65} fill="none" stroke={colors.secondary} strokeWidth="1.5" opacity="0.4" />
                <text x={half} y={half} dominantBaseline="central" textAnchor="middle"
                    fontSize={s * 0.38} fontWeight="700" fontFamily="'Instrument Serif', Georgia, serif" fill="#fff">{letter}</text>
            </>
        ),
        // 4: Hexagon
        () => {
            const r = half - 3;
            const pts = [0, 1, 2, 3, 4, 5].map(i => {
                const angle = (Math.PI / 3) * i - Math.PI / 6;
                return `${half + r * Math.cos(angle)},${half + r * Math.sin(angle)}`;
            }).join(' ');
            return (
                <>
                    <polygon points={pts} fill={colors.primary} />
                    <text x={half} y={half} dominantBaseline="central" textAnchor="middle"
                        fontSize={s * 0.38} fontWeight="700" fontFamily="'Instrument Serif', Georgia, serif" fill="#fff">{letter}</text>
                </>
            );
        },
        // 5: Rounded square with accent corner
        () => (
            <>
                <rect x="2" y="2" width={s - 4} height={s - 4} rx={s * 0.18} fill={colors.primary} />
                <circle cx={s * 0.78} cy={s * 0.22} r={s * 0.12} fill={colors.secondary} opacity="0.45" />
                <text x={half} y={half} dominantBaseline="central" textAnchor="middle"
                    fontSize={s * 0.4} fontWeight="700" fontFamily="'Instrument Serif', Georgia, serif" fill="#fff">{letter}</text>
            </>
        ),
    ];

    return (
        <svg
            width={s}
            height={s}
            viewBox={`0 0 ${s} ${s}`}
            className={`shrink-0 ${className}`}
            aria-label={`${name || slug} brand mark`}
            role="img"
        >
            {marks[type]()}
        </svg>
    );
}
