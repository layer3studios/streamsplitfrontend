'use client';
import { useState, useEffect } from 'react';
import { Link2, AlertTriangle, Search } from 'lucide-react';
import api from '../../../lib/api';
const BRAND = require('../../../lib/brand');

export default function AdminPlansPage() {
    const [plans, setPlans] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [linking, setLinking] = useState(null); // plan id being linked

    const load = async () => {
        setLoading(true);
        const [planRes, groupRes] = await Promise.all([
            api.adminGetPlans({ include_inactive: 'true' }),
            api.adminGetGroups({ limit: 500 }),
        ]);
        if (planRes.success) setPlans(planRes.data);
        if (groupRes.success) setGroups(groupRes.data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleLink = async (planId, groupId) => {
        setLinking(planId);
        const res = await api.adminLinkPlanGroup(planId, groupId || null);
        if (res.success) await load();
        setLinking(null);
    };

    const unlinked = plans.filter(p => !p.group_id);
    const filtered = plans.filter(p =>
        !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.brand_id?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Plan → Group Links</h1>
                <p className="text-[var(--muted)] text-sm mt-1">{plans.length} plans · {unlinked.length} unlinked</p>
            </div>

            {unlinked.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-red-400 text-sm font-medium">
                        {unlinked.length} plan{unlinked.length > 1 ? 's' : ''} not linked to any group — buyers won&apos;t be added to a group after payment.
                    </span>
                </div>
            )}

            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search plans or brands..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-brand-primary/50"
                />
            </div>

            <div className="card overflow-hidden hover:transform-none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border)]">
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Plan</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Brand</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Price</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Linked Group</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Seats</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}><td colSpan={6} className="py-3 px-4"><div className="skeleton h-8 rounded-lg" /></td></tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-[var(--muted)]">No plans found</td></tr>
                            ) : filtered.map(plan => {
                                const gi = plan.group_info;
                                return (
                                    <tr key={plan._id} className="border-b border-[var(--border)]/50 hover:bg-white/2 transition-all">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                                                    <Link2 className="w-4 h-4 text-brand-primary-light" />
                                                </div>
                                                <span className="text-[var(--text)] text-sm font-medium">{plan.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-[var(--muted)] text-sm">{plan.brand_id?.name || '—'}</td>
                                        <td className="py-3 px-4 text-[var(--text)] text-sm font-medium">{BRAND.currency.symbol}{plan.price}</td>
                                        <td className="py-3 px-4">
                                            <select
                                                value={plan.group_id || ''}
                                                onChange={e => handleLink(plan._id, e.target.value)}
                                                disabled={linking === plan._id}
                                                className={`text-sm rounded-lg px-2 py-1.5 border bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-brand-primary/50 ${
                                                    !plan.group_id ? 'border-red-500/50' : 'border-[var(--border)]'
                                                }`}
                                            >
                                                <option value="">— None —</option>
                                                {groups.map(g => (
                                                    <option key={g._id} value={g._id}>
                                                        {g.name} ({g.member_count}/{g.group_limit || g.share_limit})
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-3 px-4">
                                            {gi ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[var(--text)] text-sm">{gi.seats_filled}/{gi.seats_total}</span>
                                                    <div className="w-16 h-1.5 bg-dark-border rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${gi.is_full ? 'bg-red-500' : 'brand-gradient'}`}
                                                            style={{ width: `${(gi.seats_filled / gi.seats_total) * 100}%` }} />
                                                    </div>
                                                </div>
                                            ) : <span className="text-[var(--muted)] text-xs">—</span>}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                plan.is_active ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                                            }`}>{plan.is_active ? 'Active' : 'Inactive'}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
