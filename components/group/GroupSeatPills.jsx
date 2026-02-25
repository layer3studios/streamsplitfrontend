'use client';

/**
 * GroupSeatPills — Mini dot indicator showing filled/empty seats.
 * Owner seat has accent dot. Max 8 dots shown; overflow as "+N".
 */
export default function GroupSeatPills({ memberCount = 0, shareLimit = 4, className = '' }) {
    const maxDots = Math.min(shareLimit, 8);
    const overflow = shareLimit > 8 ? shareLimit - 8 : 0;

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {Array.from({ length: maxDots }).map((_, i) => {
                const filled = i < memberCount;
                const isOwner = i === 0 && filled;
                return (
                    <span
                        key={i}
                        className={`inline-block rounded-full transition-colors ${filled
                                ? isOwner
                                    ? 'bg-[var(--accent)]'
                                    : 'bg-[var(--text)]'
                                : 'border border-[var(--border)]'
                            }`}
                        style={{ width: 6, height: 6 }}
                        title={isOwner ? 'Owner' : filled ? `Seat ${i + 1}` : 'Empty'}
                    />
                );
            })}
            {overflow > 0 && (
                <span className="text-[9px] text-[var(--muted)] leading-none ml-0.5">+{overflow}</span>
            )}
        </div>
    );
}
