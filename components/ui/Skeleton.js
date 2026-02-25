export function CardSkeleton() {
    return (
        <div className="paper-card p-5 space-y-3">
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
        </div>
    );
}

export function ListSkeleton({ rows = 3 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 paper-card">
                    <div className="skeleton w-10 h-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="skeleton h-4 w-1/2 rounded" />
                        <div className="skeleton h-3 w-1/3 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function GridSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}
