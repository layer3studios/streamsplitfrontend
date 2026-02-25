'use client';
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, ArrowDownRight, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Header from '../../../components/layout/Header';
import MobileNav from '../../../components/layout/MobileNav';
import AuthModal from '../../../components/ui/AuthModal';
import { useStore } from '../../../lib/store';
import api from '../../../lib/api';
const BRAND = require('../../../lib/brand');

export default function OwnerEarningsPage() {
    const { isAuthenticated, setShowAuthModal } = useStore();
    const [summary, setSummary] = useState(null);
    const [txns, setTxns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) return;
        (async () => {
            setLoading(true);
            const [sumRes, txRes] = await Promise.all([
                api.getEarningsSummary(),
                api.getEarningsTransactions(),
            ]);
            if (sumRes.success) setSummary(sumRes.data);
            if (txRes.success) setTxns(txRes.data);
            setLoading(false);
        })();
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen">
                <Header /><AuthModal />
                <main className="pt-20 pb-24 px-4 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <DollarSign className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
                        <h2 className="font-heading font-bold text-xl text-[var(--text)] mb-2">Sign in to view earnings</h2>
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
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="font-heading font-bold text-2xl text-[var(--text)]">My Earnings</h1>
                        <Link href="/owner/withdrawals" className="btn-primary py-2 px-4 text-sm flex items-center gap-1">
                            Withdrawals <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="space-y-3"><div className="skeleton h-24 rounded-2xl" /><div className="skeleton h-40 rounded-2xl" /></div>
                    ) : !summary ? (
                        <div className="card p-8 text-center">
                            <p className="text-[var(--muted)]">No earnings yet. Create a group and share the invite link!</p>
                            <Link href="/create-group" className="btn-primary mt-4 inline-block py-2 px-6 text-sm">Create Group</Link>
                        </div>
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                                <div className="card p-4 hover:transform-none">
                                    <DollarSign className="w-5 h-5 text-green-400 mb-1" />
                                    <p className="text-[var(--text)] font-heading font-bold text-xl">{BRAND.currency.symbol}{summary.withdrawable_balance}</p>
                                    <p className="text-[var(--muted)] text-xs">Withdrawable</p>
                                </div>
                                <div className="card p-4 hover:transform-none">
                                    <TrendingUp className="w-5 h-5 text-brand-primary-light mb-1" />
                                    <p className="text-[var(--text)] font-heading font-bold text-xl">{BRAND.currency.symbol}{summary.total_earned}</p>
                                    <p className="text-[var(--muted)] text-xs">Total Earned</p>
                                </div>
                                <div className="card p-4 hover:transform-none">
                                    <Users className="w-5 h-5 text-blue-400 mb-1" />
                                    <p className="text-[var(--text)] font-heading font-bold text-xl">{summary.owned_groups}</p>
                                    <p className="text-[var(--muted)] text-xs">Groups Owned</p>
                                </div>
                                <div className="card p-4 hover:transform-none">
                                    <ArrowDownRight className="w-5 h-5 text-yellow-400 mb-1" />
                                    <p className="text-[var(--text)] font-heading font-bold text-xl">{BRAND.currency.symbol}{summary.pending_withdrawals}</p>
                                    <p className="text-[var(--muted)] text-xs">Pending Withdrawals</p>
                                </div>
                            </div>

                            {/* Fee info */}
                            <div className="bg-dark-surface/50 rounded-xl p-3 mb-6 text-xs text-[var(--muted)] flex items-center justify-between">
                                <span>Platform fee: {summary.platform_cut_percent}% per seat purchase</span>
                                <span>Min withdrawal: {BRAND.currency.symbol}{summary.min_withdrawal}</span>
                            </div>

                            {/* Transaction Ledger */}
                            <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-3">Transaction History</h2>
                            {txns.length === 0 ? (
                                <div className="card p-6 text-center text-[var(--muted)] text-sm">No transactions yet</div>
                            ) : (
                                <div className="space-y-2">
                                    {txns.map(tx => (
                                        <div key={tx._id} className="card p-4 hover:transform-none">
                                            <div className="flex items-center justify-between mb-1">
                                                <div>
                                                    <p className="text-[var(--text)] text-sm font-medium">{tx.group_id?.name || 'Group'}</p>
                                                    <p className="text-[var(--muted)] text-xs">Buyer: {tx.buyer_id?.name || tx.buyer_id?.phone || 'Unknown'}</p>
                                                </div>
                                                <span className="text-green-400 font-heading font-bold">+{BRAND.currency.symbol}{tx.net}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                                                <span>Gross: {BRAND.currency.symbol}{tx.gross}</span>
                                                <span>Fee: {BRAND.currency.symbol}{tx.fee_amount} ({tx.fee_percent}%)</span>
                                                <span className="ml-auto">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                            </div>
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
