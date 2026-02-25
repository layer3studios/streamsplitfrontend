'use client';
import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Footer from '../../components/layout/Footer';
import AuthModal from '../../components/ui/AuthModal';
import AuthGate from '../../components/ui/AuthGate';
import { MotionPage } from '../../components/ui/Motion';
import { Container, SectionHeader, Divider } from '../../components/ui/Layout';
import EmptyState from '../../components/ui/EmptyState';
import { ListSkeleton } from '../../components/ui/Skeleton';
import { useStore } from '../../lib/store';
import { formatCurrency } from '../../lib/utils';
import api from '../../lib/api';

export default function WalletPage() {
  const { isAuthenticated, wallet, setWallet } = useStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState('');
  const [topping, setTopping] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    (async () => {
      const [wRes, tRes] = await Promise.all([api.getWallet(), api.getTransactions()]);
      if (wRes.success) setWallet(wRes.data);
      if (tRes.success) setTransactions(tRes.data?.transactions || tRes.data || []);
      setLoading(false);
    })();
  }, [isAuthenticated]);

  const handleTopup = async () => {
    const amt = parseFloat(topupAmount);
    if (!amt || amt <= 0) return;
    setTopping(true);
    const res = await api.topupWallet(amt);
    if (res.success) {
      const [wRes, tRes] = await Promise.all([api.getWallet(), api.getTransactions()]);
      if (wRes.success) setWallet(wRes.data);
      if (tRes.success) setTransactions(tRes.data?.transactions || tRes.data || []);
      setTopupAmount('');
    }
    setTopping(false);
  };

  return (
    <div className="min-h-screen"><Header /><AuthModal />
      <MotionPage>
        <section className="pt-28 pb-8 md:pt-36">
          <Container><SectionHeader meta="PAYMENTS" title="Wallet" /></Container>
        </section>
        <Container><Divider /></Container>

        <AuthGate>
          <section className="py-[var(--section-gap)]">
            <Container className="max-w-2xl">
              {/* Balance Card */}
              <div className="paper-card p-8 text-center mb-8">
                <p className="text-meta mb-3">CURRENT BALANCE</p>
                <h2 className="font-serif text-5xl md:text-6xl text-[var(--text)] mb-1">
                  {formatCurrency(wallet?.balance || 0)}
                </h2>
              </div>

              {/* Topup */}
              <div className="paper-card p-5 mb-8">
                <p className="text-meta mb-3">TOP UP</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={topupAmount}
                    onChange={e => setTopupAmount(e.target.value)}
                    className="input flex-1"
                  />
                  <button onClick={handleTopup} disabled={topping} className="btn-primary py-2.5 px-5 shrink-0">
                    <Plus className="w-4 h-4" /> {topping ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>

              <Divider className="mb-8" />

              {/* Transactions */}
              <SectionHeader meta="HISTORY" title="Transactions" align="left" className="mb-6" />
              {loading ? <ListSkeleton rows={5} /> : transactions.length === 0 ? (
                <EmptyState icon={WalletIcon} title="No transactions" description="Your transaction history will appear here" />
              ) : (
                <div className="space-y-0">
                  {transactions.map((tx, i) => (
                    <div key={tx._id || i}>
                      <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'credit' || tx.type === 'topup' ? 'bg-green-50 text-[var(--success)]' : 'bg-red-50 text-[var(--danger)]'
                            }`}>
                            {tx.type === 'credit' || tx.type === 'topup' ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[var(--text)] truncate">{tx.description || tx.type}</p>
                            <p className="text-meta text-[10px]">{new Date(tx.created_at || tx.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-medium whitespace-nowrap ${tx.type === 'credit' || tx.type === 'topup' ? 'text-[var(--success)]' : 'text-[var(--danger)]'
                          }`}>
                          {tx.type === 'credit' || tx.type === 'topup' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                      {i < transactions.length - 1 && <Divider />}
                    </div>
                  ))}
                </div>
              )}
            </Container>
          </section>
        </AuthGate>
        <Footer />
      </MotionPage>
      <MobileNav />
    </div>
  );
}
