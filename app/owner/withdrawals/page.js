'use client';
import { useState, useEffect } from 'react';
import { ArrowDownRight, Loader2, CheckCircle, AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import Header from '../../../components/layout/Header';
import MobileNav from '../../../components/layout/MobileNav';
import AuthModal from '../../../components/ui/AuthModal';
import { useStore } from '../../../lib/store';
import api from '../../../lib/api';
const BRAND = require('../../../lib/brand');

const STATUS_COLORS = {
    requested: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    processing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    paid: 'bg-green-500/10 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function OwnerWithdrawalsPage() {
    const { isAuthenticated, setShowAuthModal } = useStore();
    const [summary, setSummary] = useState(null);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [form, setForm] = useState({ amount: '', payout_method: 'upi', upi_id: '' });

    const load = async () => {
        setLoading(true);
        const [sumRes, wRes] = await Promise.all([api.getEarningsSummary(), api.getMyWithdrawals()]);
        if (sumRes.success) setSummary(sumRes.data);
        if (wRes.success) setWithdrawals(wRes.data);
        setLoading(false);
    };

    useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated]);

    const handleRequest = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setResult(null);
        const res = await api.requestWithdrawal({
            amount: parseFloat(form.amount),
            payout_method: form.payout_method,
            payout_details: form.payout_method === 'upi' ? { upi_id: form.upi_id } : {},
        });
        setSubmitting(false);
        if (res.success) {
            setResult({ type: 'success', message: 'Withdrawal requested!' });
            setShowForm(false);
            setForm({ amount: '', payout_method: 'upi', upi_id: '' });
            load();
        } else {
            setResult({ type: 'error', message: res.message || 'Request failed' });
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen">
                <Header /><AuthModal />
                <main className="pt-20 pb-24 px-4 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <ArrowDownRight className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
                        <h2 className="font-heading font-bold text-xl text-[var(--text)] mb-2">Sign in to view withdrawals</h2>
                        <button onClick={() => setShowAuthModal(true)} className="btn-primary py-3 px-8 text-sm">Login / Sign Up</button>
                    </div>
                </main>
                <MobileNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header /><AuthModal />
            <main className="pt-20 pb-24 md:pb-8 px-4 lg:px-6">
                <div className="max-w-2xl mx-auto">
                    <Link href="/owner/earnings" className="flex items-center gap-2 text-gray-400 hover:text-[var(--text)] text-sm mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Earnings
                    </Link>

                    <div className="flex items-center justify-between mb-6">
                        <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Withdrawals</h1>
                        {summary && summary.withdrawable_balance >= summary.min_withdrawal && !showForm && (
                            <button onClick={() => setShowForm(true)} className="btn-primary py-2 px-4 text-sm">Request Withdrawal</button>
                        )}
                    </div>

                    {loading ? (
                        <div className="skeleton h-40 rounded-2xl" />
                    ) : (
                        <>
                            {/* Balance */}
                            <div className="card p-4 mb-5 flex items-center justify-between hover:transform-none">
                                <div>
                                    <p className="text-[var(--muted)] text-xs">Withdrawable Balance</p>
                                    <p className="text-[var(--text)] font-heading font-bold text-2xl">{BRAND.currency.symbol}{summary?.withdrawable_balance || 0}</p>
                                </div>
                                <p className="text-[var(--muted)] text-xs">Min: {BRAND.currency.symbol}{summary?.min_withdrawal || 100}</p>
                            </div>

                            {/* Result */}
                            {result && (
                                <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${result.type === 'success' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                    {result.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                                    <p className={`text-sm ${result.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{result.message}</p>
                                </div>
                            )}

                            {/* Request Form */}
                            {showForm && (
                                <form onSubmit={handleRequest} className="card p-5 mb-5 space-y-3 hover:transform-none">
                                    <h3 className="text-[var(--text)] font-heading font-bold text-sm">Request Withdrawal</h3>
                                    <div>
                                        <label className="block text-xs text-[var(--muted)] mb-1">Amount ({BRAND.currency.symbol})</label>
                                        <input type="number" min={summary?.min_withdrawal || 100} max={summary?.withdrawable_balance || 0}
                                            value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                                            className="input py-2" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-[var(--muted)] mb-1">Payout Method</label>
                                        <select value={form.payout_method} onChange={e => setForm({ ...form, payout_method: e.target.value })} className="input py-2">
                                            <option value="upi">UPI</option>
                                            <option value="bank">Bank Transfer</option>
                                        </select>
                                    </div>
                                    {form.payout_method === 'upi' && (
                                        <div>
                                            <label className="block text-xs text-[var(--muted)] mb-1">UPI ID</label>
                                            <input value={form.upi_id} onChange={e => setForm({ ...form, upi_id: e.target.value })}
                                                placeholder="name@upi" className="input py-2" required />
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-1">
                                            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Request'}
                                        </button>
                                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-[var(--muted)] border border-[var(--border)] rounded-xl hover:bg-white/5">Cancel</button>
                                    </div>
                                </form>
                            )}

                            {/* History */}
                            <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-3">History</h2>
                            {withdrawals.length === 0 ? (
                                <div className="card p-6 text-center text-[var(--muted)] text-sm hover:transform-none">No withdrawal requests yet</div>
                            ) : (
                                <div className="space-y-2">
                                    {withdrawals.map(w => (
                                        <div key={w._id} className="card p-4 hover:transform-none">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_COLORS[w.status] || ''}`}>
                                                        {w.status}
                                                    </span>
                                                    <span className="text-[var(--text)] font-heading font-bold">{BRAND.currency.symbol}{w.amount}</span>
                                                </div>
                                                <span className="text-[var(--muted)] text-xs">{new Date(w.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[var(--muted)] text-xs">{w.payout_method.toUpperCase()} • {w.payout_details?.upi_id || 'Bank transfer'}</p>
                                            {w.reject_reason && <p className="text-red-400 text-xs mt-1">Reason: {w.reject_reason}</p>}
                                            {w.razorpay_payout_id && <p className="text-[var(--muted)] text-xs mt-1">Payout ID: {w.razorpay_payout_id}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
