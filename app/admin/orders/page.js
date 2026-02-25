'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../lib/api';
const BRAND = require('../../../lib/brand');

const STATUS_OPTIONS = ['', 'pending', 'paid', 'fulfilled', 'cancelled', 'refunded'];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [actionLoading, setActionLoading] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        const params = { page };
        if (statusFilter) params.status = statusFilter;
        const res = await api.adminGetOrders(params);
        if (res.success) { setOrders(res.data); setPagination(res.pagination || {}); }
        setLoading(false);
    };

    useEffect(() => { fetchOrders(); }, [page, statusFilter]);

    const handleStatusChange = async (orderId, newStatus) => {
        setActionLoading(orderId);
        await api.adminUpdateOrder(orderId, { status: newStatus });
        setActionLoading(null);
        fetchOrders();
    };

    const statusColors = {
        pending: 'text-yellow-400 bg-yellow-400/10',
        paid: 'text-blue-400 bg-blue-400/10',
        fulfilled: 'text-green-400 bg-green-400/10',
        cancelled: 'text-red-400 bg-red-400/10',
        refunded: 'text-gray-400 bg-gray-400/10',
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-heading font-bold text-2xl text-white">Order Management</h1>
                <p className="text-gray-500 text-sm mt-1">{pagination.total || 0} total orders</p>
            </div>

            <div className="flex gap-3 mb-5">
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input py-2.5 w-auto">
                    <option value="">All Status</option>
                    {STATUS_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="card overflow-hidden hover:transform-none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-dark-border">
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Order #</th>
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Items</th>
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Total</th>
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Payment</th>
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Status</th>
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Date</th>
                                <th className="text-right text-gray-500 text-xs font-medium uppercase py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}><td colSpan={7} className="py-3 px-4"><div className="skeleton h-8 rounded-lg" /></td></tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-gray-500">No orders found</td></tr>
                            ) : orders.map(order => (
                                <tr key={order._id} className="border-b border-dark-border/50 hover:bg-white/2 transition-all">
                                    <td className="py-3 px-4 text-white text-sm font-mono">{order.order_number}</td>
                                    <td className="py-3 px-4 text-gray-400 text-sm">
                                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                                    </td>
                                    <td className="py-3 px-4 text-white text-sm font-heading font-bold">{BRAND.currency.symbol}{order.total}</td>
                                    <td className="py-3 px-4 text-gray-400 text-sm">{order.payment_method || '—'}</td>
                                    <td className="py-3 px-4">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status] || 'text-gray-400 bg-gray-400/10'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 text-right">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            disabled={actionLoading === order._id}
                                            className="bg-transparent border border-dark-border rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-brand-primary"
                                        >
                                            {STATUS_OPTIONS.filter(Boolean).map(s => <option key={s} value={s} className="bg-dark-bg">{s}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-dark-border">
                        <span className="text-gray-500 text-xs">Page {pagination.page} of {pagination.pages}</span>
                        <div className="flex gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
