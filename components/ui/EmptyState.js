export default function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, className = '' }) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
            {Icon && (
                <div className="w-14 h-14 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-[var(--muted)]" />
                </div>
            )}
            <h3 className="text-heading text-[var(--text)] mb-2">{title}</h3>
            {description && (
                <p className="text-caption max-w-xs">{description}</p>
            )}
            {actionLabel && actionHref && (
                <a href={actionHref} className="btn-primary mt-6 text-sm">
                    {actionLabel}
                </a>
            )}
        </div>
    );
}
