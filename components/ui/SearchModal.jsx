'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, Tag, Package, Users, User as UserIcon } from 'lucide-react';
import { ListSkeleton } from '../ui/Skeleton';
import api from '../../lib/api';

const TABS = [
    { key: 'brands', label: 'Brands', icon: Tag },
    { key: 'plans', label: 'Plans', icon: Package },
    { key: 'groups', label: 'Groups', icon: Users },
    { key: 'hosts', label: 'Hosts', icon: UserIcon },
];

export default function SearchModal({ isOpen, onClose }) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [tab, setTab] = useState('brands');
    const [results, setResults] = useState({ brands: [], plans: [], groups: [], hosts: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) { setQuery(''); setResults({ brands: [], plans: [], groups: [], hosts: [] }); }
    }, [isOpen]);

    useEffect(() => {
        if (query.trim().length < 2) { setResults({ brands: [], plans: [], groups: [], hosts: [] }); return; }
        const timer = setTimeout(async () => {
            setLoading(true);
            const res = await api.unifiedSearch(query.trim());
            if (res.success) setResults(res.data);
            setLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const navigateTo = (path) => { router.push(path); onClose(); };

    const currentResults = results[tab] || [];
    const totalCount = Object.values(results).reduce((s, arr) => s + arr.length, 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 md:pt-28">
            <div className="absolute inset-0 bg-[var(--text)]/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[var(--bg)] border border-[var(--border)] rounded-2xl w-full max-w-lg mx-4 max-h-[70vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Search input */}
                <div className="p-4 border-b border-[var(--border)]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                        <input type="text" autoFocus value={query} onChange={e => setQuery(e.target.value)}
                            placeholder="Search brands, plans, groups, hosts..."
                            className="input pl-10 w-full" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[var(--border)]">
                    {TABS.map(t => {
                        const count = (results[t.key] || []).length;
                        return (
                            <button key={t.key} onClick={() => setTab(t.key)}
                                className={`flex-1 py-2 text-[10px] font-medium tracking-wider text-center transition-colors ${tab === t.key ? 'text-[var(--text)] border-b-2 border-[var(--text)]' : 'text-[var(--muted)]'
                                    }`}>
                                <t.icon className="w-3 h-3 mx-auto mb-0.5" />
                                {t.label}{count > 0 && <span className="ml-1 opacity-60">({count})</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-3">
                    {loading ? (
                        <ListSkeleton rows={3} />
                    ) : query.trim().length < 2 ? (
                        <p className="text-caption text-center py-8">Type at least 2 characters to search</p>
                    ) : currentResults.length === 0 ? (
                        <p className="text-caption text-center py-8">No {tab} found</p>
                    ) : (
                        <div className="space-y-1">
                            {tab === 'brands' && currentResults.map(b => (
                                <button key={b._id} onClick={() => navigateTo(`/explore/${b.slug}`)}
                                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface)] transition-colors text-left">
                                    {b.logo_url && b.logo_url.trim().length > 10 && !b.logo_url.match(/^data:;/) ? (
                                        <img src={b.logo_url} alt="" className="w-8 h-8 rounded-lg object-contain bg-[var(--surface)]" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg bg-[var(--surface)] flex items-center justify-center">
                                            <Tag className="w-4 h-4 text-[var(--muted)]" />
                                        </div>
                                    )}
                                    <p className="text-sm text-[var(--text)]">{b.name}</p>
                                </button>
                            ))}

                            {tab === 'plans' && currentResults.map(p => (
                                <button key={p._id} onClick={() => navigateTo(`/explore/${p.brand_id?.slug || ''}`)}
                                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface)] transition-colors text-left">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--surface)] flex items-center justify-center">
                                        <Package className="w-4 h-4 text-[var(--muted)]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[var(--text)] truncate">{p.name}</p>
                                        <p className="text-[10px] text-[var(--muted)]">{p.brand_id?.name} · ₹{p.price}</p>
                                    </div>
                                </button>
                            ))}

                            {tab === 'groups' && currentResults.map(g => (
                                <button key={g._id} onClick={() => navigateTo('/groups')}
                                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface)] transition-colors text-left">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--surface)] flex items-center justify-center">
                                        <Users className="w-4 h-4 text-[var(--muted)]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[var(--text)] truncate">{g.name}</p>
                                        <p className="text-[10px] text-[var(--muted)]">{g.member_count}/{g.share_limit} seats · ₹{g.share_price}</p>
                                    </div>
                                </button>
                            ))}

                            {tab === 'hosts' && currentResults.map(h => (
                                <button key={h._id} onClick={() => { }}
                                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface)] transition-colors text-left">
                                    <div className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center">
                                        <UserIcon className="w-4 h-4 text-[var(--muted)]" />
                                    </div>
                                    <p className="text-sm text-[var(--text)]">{h.name}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-[var(--border)] text-center">
                    <button onClick={onClose} className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                        Press Esc to close
                    </button>
                </div>
            </div>
        </div>
    );
}
