'use client';
import { useState, useEffect } from 'react';
import { Users, ShoppingBag, DollarSign, UsersRound, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../../lib/api';
const BRAND = require('../../lib/brand');

export default function AdminOverview() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const res = await api.adminOverview();
            if (res.success) setData(res.data);
            setLoading(false);
        })();
    }, []);

    const kpis = data ? [
        { label: 'Total Users', value: data.stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Total Orders', value: data.stats.totalOrders, icon: ShoppingBag, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Revenue', value: `${BRAND.currency.symbol}${data.stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Active Groups', value: data.stats.activeGroups, icon: UsersRound, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    ] : [];

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Dashboard Overview</h1>
                <p className="text-[var(--muted)] text-sm mt-1">Welcome to {BRAND.name} Admin</p>
            </div>

            {/* KPI Cards */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {kpis.map((kpi) => (
                        <div key={kpi.label} className="card p-5 hover:transform-none">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                                </div>
                            </div>
                            <p className="text-2xl font-heading font-bold text-[var(--text)]">{kpi.value}</p>
                            <p className="text-[var(--muted)] text-sm mt-0.5">{kpi.label}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="card p-5 hover:transform-none">
                    <h3 className="font-heading font-semibold text-[var(--text)] mb-4">Recent Signups</h3>
                    {loading ? (
                        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
                    ) : (
                        <div className="space-y-2">
                            {data?.recentUsers?.map(u => (
                                <div key={u._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/3 transition-all">
                                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                                        <span className="text-brand-primary-light text-xs font-bold">{(u.name || 'U').charAt(0)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[var(--text)] text-sm font-medium truncate">{u.name || 'Unnamed'}</p>
                                        <p className="text-[var(--muted)] text-xs">{u.phone}</p>
                                    </div>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.role === 'admin' || u.role === 'super_admin' ? 'text-purple-400 bg-purple-400/10' : 'text-[var(--muted)] bg-gray-400/10'
                                        }`}>{u.role}</span>
                                    <span className="text-[var(--muted)] text-xs">{new Date(u.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="card p-5 hover:transform-none">
                    <h3 className="font-heading font-semibold text-[var(--text)] mb-4">Recent Orders</h3>
                    {loading ? (
                        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
                    ) : data?.recentOrders?.length === 0 ? (
                        <p className="text-[var(--muted)] text-sm py-6 text-center">No orders yet</p>
                    ) : (
                        <div className="space-y-2">
                            {data?.recentOrders?.map(o => (
                                <div key={o._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/3 transition-all">
                                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <ShoppingBag className="w-4 h-4 text-green-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[var(--text)] text-sm font-medium">{o.order_number}</p>
                                        <p className="text-[var(--muted)] text-xs">{o.payment_method}</p>
                                    </div>
                                    <span className="text-[var(--text)] font-heading font-bold text-sm">{BRAND.currency.symbol}{o.total}</span>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${o.status === 'fulfilled' ? 'text-green-400 bg-green-400/10' :
                                            o.status === 'pending' ? 'text-yellow-400 bg-yellow-400/10' :
                                                'text-[var(--muted)] bg-gray-400/10'
                                        }`}>{o.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
