'use client';
import { SectionHeader, Divider } from './Layout';

export default function PageHeader({ title, subtitle, actions, className = '' }) {
    return (
        <div className={`mb-10 ${className}`}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                    {subtitle && <p className="text-meta mb-3">{subtitle}</p>}
                    <h1 className="text-display text-[var(--text)] m-0 leading-none">{title}</h1>
                </div>
                {actions && (
                    <div className="flex gap-3 shrink-0">{actions}</div>
                )}
            </div>
            <Divider className="mt-6" />
        </div>
    );
}
