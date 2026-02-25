'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Ticket, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../../lib/api';
const BRAND = require('../../../lib/brand');

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ code: '', type: 'percentage', value: '', max_discount: '', min_order_value: '', usage_limit: '' });
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchCoupons = async () => {
        setLoading(true);
        const res = await api.adminGetCoupons();
        if (res.success) setCoupons(res.data);
        setLoading(false);
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.code || !form.value) return;
        setSaving(true);
        const data = {
            code: form.code,
            type: form.type,
            value: Number(form.value),
            max_discount: Number(form.max_discount) || 0,
            min_order_value: Number(form.min_order_value) || 0,
            usage_limit: Number(form.usage_limit) || -1,
        };
        const res = await api.adminCreateCoupon(data);
        setSaving(false);
        if (res.success) {
            setForm({ code: '', type: 'percentage', value: '', max_discount: '', min_order_value: '', usage_limit: '' });
            setShowForm(false);
            fetchCoupons();
        }
    };

    const handleToggle = async (coupon) => {
        setActionLoading(coupon._id);
        await api.adminUpdateCoupon(coupon._id, { is_active: !coupon.is_active });
        setActionLoading(null);
        fetchCoupons();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Coupon Management</h1>
                    <p className="text-[var(--muted)] text-sm mt-1">{coupons.length} coupons</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2">
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Cancel' : 'Create Coupon'}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <form onSubmit={handleCreate} className="card p-5 mb-6 hover:transform-none animate-slide-up">
                    <h3 className="font-heading font-semibold text-[var(--text)] mb-4">New Coupon</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                            <label className="text-[var(--muted)] text-xs font-medium mb-1 block">Code *</label>
                            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                placeholder="WELCOME50" className="input py-2.5" required />
                        </div>
                        <div>
                            <label className="text-[var(--muted)] text-xs font-medium mb-1 block">Type *</label>
                            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input py-2.5">
                                <option value="percentage">Percentage</option>
                                <option value="flat">Flat</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[var(--muted)] text-xs font-medium mb-1 block">Value *</label>
                            <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                                placeholder={form.type === 'percentage' ? '50' : '100'} className="input py-2.5" required />
                        </div>
                        <div>
                            <label className="text-[var(--muted)] text-xs font-medium mb-1 block">Max Discount</label>
                            <input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
                                placeholder="0 = no limit" className="input py-2.5" />
                        </div>
                        <div>
                            <label className="text-[var(--muted)] text-xs font-medium mb-1 block">Min Order Value</label>
                            <input type="number" value={form.min_order_value} onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
                                placeholder="0" className="input py-2.5" />
                        </div>
                        <div>
                            <label className="text-[var(--muted)] text-xs font-medium mb-1 block">Usage Limit</label>
                            <input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                                placeholder="-1 = unlimited" className="input py-2.5" />
                        </div>
                    </div>
                    <button type="submit" disabled={saving} className="btn-primary mt-4 px-6 py-2.5 text-sm">
                        {saving ? 'Creating...' : 'Create Coupon'}
                    </button>
                </form>
            )}

            {/* Coupons Table */}
            <div className="card overflow-hidden hover:transform-none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border)]">
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Code</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Type</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Value</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Max Discount</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Min Order</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Usage</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase py-3 px-4">Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i}><td colSpan={7} className="py-3 px-4"><div className="skeleton h-8 rounded-lg" /></td></tr>
                                ))
                            ) : coupons.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-[var(--muted)]">No coupons yet</td></tr>
                            ) : coupons.map(coupon => (
                                <tr key={coupon._id} className="border-b border-[var(--border)]/50 hover:bg-white/2 transition-all">
                                    <td className="py-3 px-4">
                                        <span className="bg-brand-primary/10 text-brand-primary-light font-mono font-bold text-sm px-2.5 py-1 rounded-lg">
                                            {coupon.code}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-[var(--muted)] text-sm capitalize">{coupon.type}</td>
                                    <td className="py-3 px-4 text-[var(--text)] text-sm font-medium">
                                        {coupon.type === 'percentage' ? `${coupon.value}%` : `${BRAND.currency.symbol}${coupon.value}`}
                                    </td>
                                    <td className="py-3 px-4 text-[var(--muted)] text-sm">
                                        {coupon.max_discount ? `${BRAND.currency.symbol}${coupon.max_discount}` : '—'}
                                    </td>
                                    <td className="py-3 px-4 text-[var(--muted)] text-sm">
                                        {coupon.min_order_value ? `${BRAND.currency.symbol}${coupon.min_order_value}` : '—'}
                                    </td>
                                    <td className="py-3 px-4 text-[var(--muted)] text-sm">
                                        {coupon.used_count || 0}/{coupon.usage_limit === -1 ? '∞' : coupon.usage_limit}
                                    </td>
                                    <td className="py-3 px-4">
                                        <button
                                            onClick={() => handleToggle(coupon)}
                                            disabled={actionLoading === coupon._id}
                                            className="transition-all"
                                        >
                                            {coupon.is_active !== false ? (
                                                <ToggleRight className="w-6 h-6 text-green-400" />
                                            ) : (
                                                <ToggleLeft className="w-6 h-6 text-[var(--muted)]" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
