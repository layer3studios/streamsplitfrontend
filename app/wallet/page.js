'use client';
import { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import {
  Wallet as WalletIcon, TrendingUp, ArrowUpRight, ArrowDownLeft,
  Plus, Download, Filter, Search, Banknote, Clock, CheckCircle,
  XCircle, AlertCircle, Smartphone
} from 'lucide-react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Footer from '../../components/layout/Footer';
import AuthModal from '../../components/ui/AuthModal';
import AuthGate from '../../components/ui/AuthGate';
import { MotionPage } from '../../components/ui/Motion';
import { Container, SectionHeader, Divider } from '../../components/ui/Layout';
import EmptyState from '../../components/ui/EmptyState';
import { ListSkeleton } from '../../components/ui/Skeleton';
import WithdrawModal from '../../components/wallet/WithdrawModal';
import { useStore } from '../../lib/store';
import { formatCurrency } from '../../lib/utils';
import api from '../../lib/api';

const STATUS_MAP = {
  requested: { icon: Clock, color: 'text-[var(--warning)]', bg: 'bg-amber-50', label: 'Requested' },
  approved: { icon: CheckCircle, color: 'text-[var(--info)]', bg: 'bg-blue-50', label: 'Approved' },
  processing: { icon: AlertCircle, color: 'text-[var(--info)]', bg: 'bg-blue-50', label: 'Processing' },
  paid: { icon: CheckCircle, color: 'text-[var(--success)]', bg: 'bg-green-50', label: 'Paid' },
  rejected: { icon: XCircle, color: 'text-[var(--danger)]', bg: 'bg-red-50', label: 'Rejected' },
};

export default function WalletPage() {
  const { isAuthenticated, wallet, setWallet } = useStore();
  // Main tab: wallet vs earnings
  const [mainTab, setMainTab] = useState('wallet');

  // Wallet state
  const [walletTxns, setWalletTxns] = useState([]);
  const [walletLoading, setWalletLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState('');
  const [topping, setTopping] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [walletPagination, setWalletPagination] = useState(null);
  const [walletPage, setWalletPage] = useState(1);

  // Earnings state
  const [earnSummary, setEarnSummary] = useState(null);
  const [earnTxns, setEarnTxns] = useState([]);
  const [earnLoading, setEarnLoading] = useState(true);
  const [earnSubTab, setEarnSubTab] = useState('summary');
  const [earnWithdrawals, setEarnWithdrawals] = useState([]);
  const [earnTxPage, setEarnTxPage] = useState(1);
  const [earnTxPagination, setEarnTxPagination] = useState(null);

  // Withdraw modal
  const [withdrawSource, setWithdrawSource] = useState(null); // null = closed, 'wallet' or 'earnings'

  useEffect(() => {
    if (!isAuthenticated) { setWalletLoading(false); setEarnLoading(false); return; }
    loadWallet();
    loadEarnings();
  }, [isAuthenticated]);

  // ─── Wallet loaders ───────────────────────────
  const loadWallet = async () => {
    setWalletLoading(true);
    const [wRes, tRes] = await Promise.all([
      api.getWallet(),
      api.getWalletTransactions({ page: 1, limit: 20 }),
    ]);
    if (wRes.success) setWallet(wRes.data);
    if (tRes.success) { setWalletTxns(tRes.data); setWalletPagination(tRes.pagination); }
    setWalletLoading(false);
  };

  const loadWalletTxns = async (p = 1) => {
    const params = { page: p, limit: 20 };
    if (filterType) params.type = filterType;
    if (filterSearch.trim()) params.search = filterSearch.trim();
    const tRes = await api.getWalletTransactions(params);
    if (tRes.success) {
      if (p === 1) setWalletTxns(tRes.data);
      else setWalletTxns(prev => [...prev, ...tRes.data]);
      setWalletPagination(tRes.pagination);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    setWalletPage(1); loadWalletTxns(1);
  }, [filterType]);

  const handleSearch = () => { setWalletPage(1); loadWalletTxns(1); };

  const handleTopup = useCallback(async () => {
    const amt = parseFloat(topupAmount);
    if (!amt || amt <= 0) return;
    setTopping(true);

    const res = await api.initiateTopup(amt);
    if (!res.success) { setTopping(false); return; }

    // Dev mode: direct credit
    if (res.data?.dev) {
      await loadWallet(); setTopupAmount(''); setTopping(false);
      return;
    }

    // Production: open Razorpay checkout
    if (!window.Razorpay) { setTopping(false); return; }
    const options = {
      key: res.data.key_id,
      amount: Math.round(amt * 100),
      currency: 'INR',
      name: 'StreamSplit Wallet',
      description: `Top up ₹${amt}`,
      order_id: res.data.order_id,
      handler: async (response) => {
        const verify = await api.verifyTopup({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          amount: amt,
        });
        if (verify.success) { await loadWallet(); setTopupAmount(''); }
        setTopping(false);
      },
      modal: { ondismiss: () => setTopping(false) },
      theme: { color: '#6366f1' },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }, [topupAmount]);

  // ─── Earnings loaders ─────────────────────────
  const loadEarnings = async () => {
    setEarnLoading(true);
    const [sRes, tRes, wRes] = await Promise.all([
      api.getEarningsSummary(),
      api.getEarningsTransactions(1),
      api.getMyWithdrawals('earnings'),
    ]);
    if (sRes.success) setEarnSummary(sRes.data);
    if (tRes.success) { setEarnTxns(tRes.data); setEarnTxPagination(tRes.pagination); }
    if (wRes.success) setEarnWithdrawals(wRes.data);
    setEarnLoading(false);
  };

  const loadMoreEarnTxns = async () => {
    const next = earnTxPage + 1;
    const res = await api.getEarningsTransactions(next);
    if (res.success) {
      setEarnTxns(prev => [...prev, ...res.data]);
      setEarnTxPagination(res.pagination);
      setEarnTxPage(next);
    }
  };

  // ─── CSV export ───────────────────────────────
  const exportWalletCSV = () => {
    const rows = ['Date,Type,Source,Amount,Balance After,Description'];
    walletTxns.forEach(tx => {
      rows.push(`"${new Date(tx.createdAt).toISOString()}","${tx.type}","${tx.source || ''}","${tx.amount}","${tx.balance_after || ''}","${(tx.description || '').replace(/"/g, '""')}"`);
    });
    downloadCSV(rows, 'wallet_statement.csv');
  };

  const exportEarningsCSV = () => {
    const rows = ['Date,Group,Buyer,Gross,Platform Fee,Net'];
    earnTxns.forEach(tx => {
      rows.push(`"${new Date(tx.createdAt).toISOString()}","${tx.group_id?.name || ''}","${tx.buyer_id?.name || ''}","${tx.gross}","${tx.fee_amount}","${tx.net}"`);
    });
    downloadCSV(rows, 'earnings_statement.csv');
  };

  const downloadCSV = (rows, filename) => {
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen"><Header /><AuthModal />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setRazorpayReady(true)} />
      <MotionPage>
        <section className="pt-28 pb-8 md:pt-36">
          <Container><SectionHeader meta="MONEY" title="Payments" /></Container>
        </section>
        <Container><Divider /></Container>

        <AuthGate>
          <section className="py-[var(--section-gap)]">
            <Container className="max-w-3xl">

              {/* ═══════ Top tab bar: Wallet / Earnings ═══════ */}
              <div className="flex gap-0 mb-8 border border-[var(--border)] rounded overflow-hidden">
                <button onClick={() => setMainTab('wallet')}
                  className={`flex-1 py-3.5 text-xs font-medium tracking-wider uppercase flex items-center justify-center gap-2 transition-colors ${mainTab === 'wallet' ? 'bg-[var(--text)] text-[var(--bg)]' : 'text-[var(--muted)] hover:bg-[var(--surface)]'}`}>
                  <WalletIcon className="w-4 h-4" /> Wallet Balance
                </button>
                <button onClick={() => setMainTab('earnings')}
                  className={`flex-1 py-3.5 text-xs font-medium tracking-wider uppercase flex items-center justify-center gap-2 transition-colors ${mainTab === 'earnings' ? 'bg-[var(--text)] text-[var(--bg)]' : 'text-[var(--muted)] hover:bg-[var(--surface)]'}`}>
                  <TrendingUp className="w-4 h-4" /> Earnings Balance
                </button>
              </div>

              {/* ═══════════════════════════════════════════════ */}
              {/* ═══════ WALLET TAB ═══════════════════════════ */}
              {/* ═══════════════════════════════════════════════ */}
              {mainTab === 'wallet' && (
                <div>
                  {/* Balance Card */}
                  <div className="paper-card p-8 text-center mb-6">
                    <p className="text-meta mb-2">WALLET BALANCE</p>
                    <p className="text-[10px] text-[var(--muted)] mb-3">Top-ups · Refunds · Cashback</p>
                    <h2 className="font-serif text-5xl md:text-6xl text-[var(--text)] mb-1">
                      {formatCurrency(wallet?.balance || 0)}
                    </h2>
                    {wallet?.balance > 0 && (
                      <button onClick={() => setWithdrawSource('wallet')}
                        className="mt-4 text-xs text-[var(--accent)] hover:underline flex items-center justify-center gap-1 mx-auto">
                        <Banknote className="w-3.5 h-3.5" /> Withdraw from Wallet
                      </button>
                    )}
                  </div>

                  {/* Topup */}
                  <div className="paper-card p-5 mb-6">
                    <p className="text-meta mb-3">TOP UP</p>
                    <div className="flex items-center gap-3">
                      <input type="number" placeholder="Enter amount" value={topupAmount}
                        onChange={e => setTopupAmount(e.target.value)} className="input flex-1" />
                      <button onClick={handleTopup} disabled={topping} className="btn-primary py-2.5 px-5 shrink-0">
                        <Plus className="w-4 h-4" /> {topping ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  </div>

                  <Divider className="mb-6" />

                  {/* Statement Header */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-meta">WALLET STATEMENT</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded transition-colors ${showFilters ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)] hover:bg-[var(--surface)]'}`}>
                        <Filter className="w-3.5 h-3.5" />
                      </button>
                      {walletTxns.length > 0 && (
                        <button onClick={exportWalletCSV} className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
                          <Download className="w-3 h-3" /> CSV
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filters */}
                  {showFilters && (
                    <div className="paper-card p-4 mb-4 space-y-3">
                      <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input text-xs w-full">
                        <option value="">All types</option>
                        <option value="credit">Credits only</option>
                        <option value="debit">Debits only</option>
                      </select>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-2 flex-1 input">
                          <Search className="w-3.5 h-3.5 text-[var(--muted)]" />
                          <input type="text" value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder="Search description..." className="bg-transparent outline-none text-sm text-[var(--text)] w-full" />
                        </div>
                        <button onClick={handleSearch} className="btn-primary text-xs px-4">Go</button>
                      </div>
                    </div>
                  )}

                  {/* Transaction list */}
                  {walletLoading ? <ListSkeleton rows={5} /> : walletTxns.length === 0 ? (
                    <EmptyState icon={WalletIcon} title="No wallet transactions" description="Top-ups, refunds, and cashback will appear here" />
                  ) : (
                    <div className="space-y-0">
                      {walletTxns.map((tx, i) => (
                        <div key={tx._id || i}>
                          <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-green-50 text-[var(--success)]' : 'bg-red-50 text-[var(--danger)]'}`}>
                                {tx.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[var(--text)] truncate">{tx.description || tx.type}</p>
                                <p className="text-[10px] text-[var(--muted)]">
                                  {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  {tx.source && <span className="ml-1 opacity-60">· {tx.source}</span>}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <span className={`text-sm font-medium ${tx.type === 'credit' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                                {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                              </span>
                              {tx.balance_after != null && (
                                <p className="text-[9px] text-[var(--muted)]">Bal: {formatCurrency(tx.balance_after)}</p>
                              )}
                            </div>
                          </div>
                          {i < walletTxns.length - 1 && <Divider />}
                        </div>
                      ))}
                      {walletPagination && walletPage < walletPagination.pages && (
                        <button onClick={() => { const next = walletPage + 1; setWalletPage(next); loadWalletTxns(next); }}
                          className="text-xs text-[var(--accent)] hover:underline w-full text-center py-4">Load more</button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════════════════════════════════════ */}
              {/* ═══════ EARNINGS TAB ═════════════════════════ */}
              {/* ═══════════════════════════════════════════════ */}
              {mainTab === 'earnings' && (
                <div>
                  {earnLoading ? <ListSkeleton rows={5} /> : !earnSummary ? (
                    <EmptyState icon={TrendingUp} title="No earnings yet" description="Earnings from your hosted groups will appear here" />
                  ) : (
                    <>
                      {/* Earnings balance card */}
                      <div className="paper-card p-8 text-center mb-6">
                        <p className="text-meta mb-2">EARNINGS BALANCE</p>
                        <p className="text-[10px] text-[var(--muted)] mb-3">Host income after {earnSummary.platform_cut_percent}% platform fee</p>
                        <h2 className="font-serif text-5xl md:text-6xl text-[var(--success)]">
                          {formatCurrency(earnSummary.withdrawable_balance)}
                        </h2>
                        <p className="text-[10px] text-[var(--muted)] mt-2">
                          Lifetime: {formatCurrency(earnSummary.total_earned)}
                          {(earnSummary.pending_balance || 0) > 0 && <> · Pending: {formatCurrency(earnSummary.pending_balance)}</>}
                          {earnSummary.pending_withdrawals > 0 && <> · In payout: {formatCurrency(earnSummary.pending_withdrawals)}</>}
                        </p>

                        {/* Withdraw button — always visible, disabled if insufficient */}
                        {earnSummary.earnings_withdraw_enabled && (
                          earnSummary.withdrawable_balance >= earnSummary.min_withdrawal ? (
                            <button onClick={() => setWithdrawSource('earnings')}
                              className="btn-primary text-xs mt-4 px-6 py-2.5 inline-flex items-center gap-2">
                              <Banknote className="w-4 h-4" /> Withdraw from Earnings
                            </button>
                          ) : (
                            <div className="mt-4">
                              <button disabled className="btn-primary text-xs px-6 py-2.5 inline-flex items-center gap-2 opacity-50 cursor-not-allowed">
                                <Banknote className="w-4 h-4" /> Withdraw from Earnings
                              </button>
                              <p className="text-[10px] text-[var(--muted)] mt-2">
                                {earnSummary.withdrawable_balance === 0
                                  ? 'No withdrawable balance yet'
                                  : `Min withdrawal: ${formatCurrency(earnSummary.min_withdrawal)}`}
                                {(earnSummary.pending_balance || 0) > 0 && earnSummary.withdrawal_hold_hours > 0 &&
                                  ` · ${formatCurrency(earnSummary.pending_balance)} pending (${earnSummary.withdrawal_hold_hours}h hold)`}
                              </p>
                            </div>
                          )
                        )}
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="paper-card p-4 text-center">
                          <p className="text-[9px] text-[var(--muted)] uppercase">Groups Hosted</p>
                          <p className="text-lg font-medium text-[var(--text)] mt-1">{earnSummary.owned_groups}</p>
                        </div>
                        <div className="paper-card p-4 text-center">
                          <p className="text-[9px] text-[var(--muted)] uppercase">Pending Payouts</p>
                          <p className="text-lg font-medium text-[var(--warning)] mt-1">{formatCurrency(earnSummary.pending_withdrawals)}</p>
                        </div>
                        <div className="paper-card p-4 text-center">
                          <p className="text-[9px] text-[var(--muted)] uppercase">Platform Fee</p>
                          <p className="text-lg font-medium text-[var(--text)] mt-1">{earnSummary.platform_cut_percent}%</p>
                        </div>
                      </div>

                      <Divider className="mb-6" />

                      {/* Earnings sub-tabs: Transactions / Withdrawals */}
                      <div className="flex border-b border-[var(--border)] mb-6">
                        {['transactions', 'withdrawals'].map(t => (
                          <button key={t} onClick={() => setEarnSubTab(t)}
                            className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wide transition-colors ${earnSubTab === t ? 'text-[var(--text)] border-b-2 border-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}>
                            {t}
                          </button>
                        ))}
                      </div>

                      {/* ─── Earnings Transactions ─── */}
                      {earnSubTab === 'transactions' && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-meta">EARNINGS LEDGER</p>
                            {earnTxns.length > 0 && (
                              <button onClick={exportEarningsCSV} className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
                                <Download className="w-3 h-3" /> Export CSV
                              </button>
                            )}
                          </div>

                          {/* Column headers (desktop) */}
                          <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-[9px] text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)]">
                            <div className="col-span-3">Group</div>
                            <div className="col-span-2">Buyer</div>
                            <div className="col-span-2 text-right">Gross</div>
                            <div className="col-span-2 text-right">Fee</div>
                            <div className="col-span-2 text-right">Net</div>
                            <div className="col-span-1 text-right">Date</div>
                          </div>

                          {earnTxns.length === 0 ? (
                            <EmptyState icon={TrendingUp} title="No earnings transactions" description="Income from group payments will appear here" />
                          ) : (
                            <div>
                              {earnTxns.map((tx, i) => (
                                <div key={tx._id || i}>
                                  {/* Desktop */}
                                  <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 items-center">
                                    <div className="col-span-3 text-sm text-[var(--text)] truncate">{tx.group_id?.name || '—'}</div>
                                    <div className="col-span-2 text-xs text-[var(--muted)] truncate">{tx.buyer_id?.name || '—'}</div>
                                    <div className="col-span-2 text-sm text-right text-[var(--text)]">{formatCurrency(tx.gross)}</div>
                                    <div className="col-span-2 text-sm text-right text-[var(--danger)]">-{formatCurrency(tx.fee_amount)}</div>
                                    <div className="col-span-2 text-sm text-right font-medium text-[var(--success)]">+{formatCurrency(tx.net)}</div>
                                    <div className="col-span-1 text-[10px] text-right text-[var(--muted)]">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                                  </div>
                                  {/* Mobile */}
                                  <div className="md:hidden px-1 py-3">
                                    <div className="flex justify-between items-start">
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium text-[var(--text)] truncate">{tx.group_id?.name || '—'}</p>
                                        <p className="text-[10px] text-[var(--muted)]">{tx.buyer_id?.name || '—'} · {new Date(tx.createdAt).toLocaleDateString()}</p>
                                      </div>
                                      <div className="text-right shrink-0 ml-3">
                                        <p className="text-sm font-medium text-[var(--success)]">+{formatCurrency(tx.net)}</p>
                                        <p className="text-[9px] text-[var(--muted)]">{formatCurrency(tx.gross)} − {formatCurrency(tx.fee_amount)} fee</p>
                                      </div>
                                    </div>
                                  </div>
                                  {i < earnTxns.length - 1 && <Divider />}
                                </div>
                              ))}
                              {earnTxPagination && earnTxPage < earnTxPagination.pages && (
                                <button onClick={loadMoreEarnTxns} className="text-xs text-[var(--accent)] hover:underline w-full text-center py-4">Load more</button>
                              )}
                            </div>
                          )}

                          {/* Fee explanation */}
                          <div className="paper-card p-3 mt-6 flex items-start gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-[var(--muted)] shrink-0 mt-0.5" />
                            <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                              Platform fee is {earnSummary.platform_cut_percent}% per transaction. Gross = full payment, fee is deducted, net is credited to your earnings balance.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ─── Earnings Withdrawals ─── */}
                      {earnSubTab === 'withdrawals' && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-meta">PAYOUT REQUESTS</p>
                            {earnSummary.earnings_withdraw_enabled && earnSummary.withdrawable_balance >= earnSummary.min_withdrawal && (
                              <button onClick={() => setWithdrawSource('earnings')} className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
                                <Banknote className="w-3 h-3" /> New withdrawal
                              </button>
                            )}
                          </div>
                          {earnWithdrawals.length === 0 ? (
                            <EmptyState icon={Banknote} title="No withdrawal requests" description="Your payout history will appear here" />
                          ) : (
                            <div className="space-y-3">
                              {earnWithdrawals.map(wr => {
                                const st = STATUS_MAP[wr.status] || STATUS_MAP.requested;
                                const StIcon = st.icon;
                                return (
                                  <div key={wr._id} className="paper-card p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full ${st.bg} flex items-center justify-center shrink-0`}>
                                          <StIcon className={`w-4 h-4 ${st.color}`} />
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-[var(--text)]">{formatCurrency(wr.amount)}</p>
                                          <p className="text-[10px] text-[var(--muted)]">
                                            {wr.payout_method === 'upi' ? `UPI: ${wr.payout_details?.upi_id}` : `Bank: ****${wr.payout_details?.account_number?.slice(-4)}`}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span className={`text-[10px] font-medium uppercase ${st.color}`}>{st.label}</span>
                                        <p className="text-[9px] text-[var(--muted)] mt-0.5">{new Date(wr.createdAt).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                    {/* Status dots */}
                                    <div className="flex items-center gap-1 mt-3 ml-11">
                                      {['requested', 'processing', 'paid'].map((step, i) => {
                                        const steps = ['requested', 'processing', 'paid'];
                                        const ci = steps.indexOf(wr.status === 'approved' ? 'processing' : wr.status === 'rejected' ? 'requested' : wr.status);
                                        const active = i <= ci;
                                        return (
                                          <div key={step} className="flex items-center gap-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
                                            {i < steps.length - 1 && <div className={`w-6 h-px ${active && i < ci ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />}
                                          </div>
                                        );
                                      })}
                                    </div>
                                    {wr.status === 'paid' && wr.utr && <p className="text-[9px] text-[var(--muted)] mt-2 ml-11">UTR: {wr.utr}</p>}
                                    {wr.status === 'rejected' && wr.reject_reason && <p className="text-[10px] text-[var(--danger)] mt-2 ml-11">Reason: {wr.reject_reason}</p>}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

            </Container>
          </section>
        </AuthGate>
        <Footer />
      </MotionPage>
      <MobileNav />

      {/* Withdraw Modal — source-aware */}
      <WithdrawModal
        isOpen={!!withdrawSource}
        onClose={() => setWithdrawSource(null)}
        source={withdrawSource || 'earnings'}
        maxAmount={withdrawSource === 'wallet' ? (wallet?.balance || 0) : (earnSummary?.withdrawable_balance || 0)}
        minAmount={earnSummary?.min_withdrawal || 0}
        onSuccess={() => { loadWallet(); loadEarnings(); }}
      />
    </div>
  );
}
