'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Shield, Ban, CheckCircle, Package, Wallet, UsersRound } from 'lucide-react';
import api from '../../../../lib/api';
const BRAND = require('../../../../lib/brand');

export default function AdminUserDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('orders');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        (async () => {
            const res = await api.adminGetUser(id);
            if (res.success) setData(res.data);
            setLoading(false);
        })();
    }, [id]);

    const handleToggleStatus = async () => {
        const newStatus = data.user.status === 'active' ? 'blocked' : 'active';
        setActionLoading(true);
        const res = await api.adminUpdateUser(id, { status: newStatus });
        if (res.success) setData(prev => ({ ...prev, user: res.data }));
        setActionLoading(false);
    };

    if (loading) {
        return (
            <div>
                <div className="skeleton h-8 w-48 rounded-xl mb-6" />
                <div className="skeleton h-40 rounded-2xl mb-6" />
                <div className="skeleton h-60 rounded-2xl" />
            </div>
        );
    }

    if (!data) return <div className="text-center py-20"><p className="text-gray-500">User not found</p></div>;

    const { user, wallet, orders, transactions, groups } = data;

    return (
        <div>
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Users
            </button>

            {/* Profile Card */}
            <div className="card p-6 mb-6 hover:transform-none">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-16 h-16 rounded-full brand-gradient flex items-center justify-center">
                        <span className="text-white font-heading font-bold text-2xl">{(user.name || 'U').charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-white font-heading font-bold text-xl">{user.name || 'Unnamed User'}</h2>
                        <p className="text-gray-500 text-sm">{user.phone} · Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.role === 'admin' || user.role === 'super_admin' ? 'text-purple-400 bg-purple-400/10' : 'text-blue-400 bg-blue-400/10'
                                }`}>{user.role}</span>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.status === 'active' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                                }`}>{user.status}</span>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <div className="card px-4 py-3 hover:transform-none text-center">
                            <p className="text-xl font-heading font-bold text-white">{BRAND.currency.symbol}{wallet?.balance || 0}</p>
                            <p className="text-gray-500 text-xs">Wallet</p>
                        </div>
                        <button
                            onClick={handleToggleStatus}
                            disabled={actionLoading}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${user.status === 'active' ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20' : 'text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20'
                                }`}
                        >
                            {user.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                    </div>
                </div>
                {user.referral_code && (
                    <div className="mt-4 p-3 bg-brand-primary/5 border border-brand-primary/15 rounded-xl inline-block">
                        <span className="text-gray-500 text-xs">Referral: </span>
                        <span className="text-white font-mono text-sm font-bold">{user.referral_code}</span>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-dark-surface rounded-xl p-1 mb-5 w-fit">
                {['orders', 'wallet', 'groups'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-brand-primary text-white' : 'text-gray-500 hover:text-white'
                            }`}
                    >{t}</button>
                ))}
            </div>

            {/* Orders Tab */}
            {tab === 'orders' && (
                <div className="card overflow-hidden hover:transform-none">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-dark-border">
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Order</th>
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Total</th>
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Status</th>
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No orders</td></tr>
                            ) : orders.map(o => (
                                <tr key={o._id} className="border-b border-dark-border/50">
                                    <td className="py-3 px-4 text-white text-sm">{o.order_number}</td>
                                    <td className="py-3 px-4 text-white text-sm font-medium">{BRAND.currency.symbol}{o.total}</td>
                                    <td className="py-3 px-4">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${o.status === 'fulfilled' ? 'text-green-400 bg-green-400/10' :
                                                o.status === 'pending' ? 'text-yellow-400 bg-yellow-400/10' :
                                                    'text-gray-400 bg-gray-400/10'
                                            }`}>{o.status}</span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Wallet Tab */}
            {tab === 'wallet' && (
                <div className="card overflow-hidden hover:transform-none">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-dark-border">
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Type</th>
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Amount</th>
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Source</th>
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No transactions</td></tr>
                            ) : transactions.map(t => (
                                <tr key={t._id} className="border-b border-dark-border/50">
                                    <td className="py-3 px-4">
                                        <span className={`text-xs font-semibold ${t.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>{t.type}</span>
                                    </td>
                                    <td className="py-3 px-4 text-white text-sm font-medium">{BRAND.currency.symbol}{t.amount}</td>
                                    <td className="py-3 px-4 text-gray-400 text-sm">{t.source}</td>
                                    <td className="py-3 px-4 text-gray-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Groups Tab */}
            {tab === 'groups' && (
                <div className="space-y-2">
                    {groups.length === 0 ? (
                        <div className="card p-8 text-center hover:transform-none"><p className="text-gray-500">No groups</p></div>
                    ) : groups.map(g => (
                        <div key={g._id} className="card p-4 hover:transform-none flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                                <UsersRound className="w-5 h-5 text-brand-primary-light" />
                            </div>
                            <div className="flex-1">
                                <p className="text-white text-sm font-medium">{g.name}</p>
                                <p className="text-gray-500 text-xs">{g.member_count}/{g.group_limit} members</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
