'use client';
import { useState, useEffect } from 'react';
import { UsersRound, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../lib/api';
const BRAND = require('../../../lib/brand');

export default function AdminGroupsPage() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await api.adminGetGroups({ page });
            if (res.success) { setGroups(res.data); setPagination(res.pagination || {}); }
            setLoading(false);
        })();
    }, [page]);

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Group Management</h1>
                <p className="text-[var(--muted)] text-sm mt-1">{pagination.total || 0} total groups</p>
            </div>

            <div className="card overflow-hidden hover:transform-none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border)]">
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Group</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Brand</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Members</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Share Price</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Type</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Status</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}><td colSpan={7} className="py-3 px-4"><div className="skeleton h-8 rounded-lg" /></td></tr>
                                ))
                            ) : groups.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-[var(--muted)]">No groups found</td></tr>
                            ) : groups.map(group => (
                                <tr key={group._id} className="border-b border-[var(--border)]/50 hover:bg-white/2 transition-all">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                                                <UsersRound className="w-4 h-4 text-brand-primary-light" />
                                            </div>
                                            <span className="text-[var(--text)] text-sm font-medium">{group.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-[var(--muted)] text-sm">{group.brand_id?.name || '—'}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[var(--text)] text-sm">{group.member_count}/{group.group_limit}</span>
                                            <div className="w-16 h-1.5 bg-dark-border rounded-full overflow-hidden">
                                                <div className="h-full brand-gradient rounded-full" style={{ width: `${(group.member_count / group.group_limit) * 100}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-[var(--text)] text-sm font-medium">{BRAND.currency.symbol}{group.share_price || 0}</td>
                                    <td className="py-3 px-4">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${group.is_public ? 'text-blue-400 bg-blue-400/10' : 'text-[var(--muted)] bg-gray-400/10'
                                            }`}>{group.is_public ? 'Public' : 'Private'}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                            group.status === 'active' ? 'text-green-400 bg-green-400/10' :
                                            group.status === 'expired' ? 'text-red-400 bg-red-400/10' :
                                            group.status === 'waiting' ? 'text-yellow-400 bg-yellow-400/10' :
                                            'text-[var(--muted)] bg-gray-400/10'
                                            }`}>{group.status || 'waiting'}</span>
                                    </td>
                                    <td className="py-3 px-4 text-[var(--muted)] text-xs">{new Date(group.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
                        <span className="text-[var(--muted)] text-xs">Page {pagination.page} of {pagination.pages}</span>
                        <div className="flex gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--text)] hover:bg-white/5 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages} className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--text)] hover:bg-white/5 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
