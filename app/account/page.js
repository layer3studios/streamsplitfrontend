'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, LogOut, ChevronRight, Edit2, ShoppingBag, Wallet, Users, Bell } from 'lucide-react';
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

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, logout: storeLogout } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    api.getOrders().then(r => {
      if (r.success) setOrders(r.data?.orders || r.data || []);
      setLoading(false);
    });
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try { await api.logout(); } catch { }
    api.clearTokens();
    storeLogout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    router.push('/');
  };

  const menuItems = [
    { label: 'My Orders', icon: ShoppingBag, href: '#orders' },
    { label: 'Wallet', icon: Wallet, href: '/wallet' },
    { label: 'My Groups', icon: Users, href: '/groups' },
    { label: 'Notifications', icon: Bell, href: '#' },
  ];

  return (
    <div className="min-h-screen"><Header /><AuthModal />
      <MotionPage>
        <section className="pt-28 pb-8 md:pt-36">
          <Container><SectionHeader meta="SETTINGS" title="Account" /></Container>
        </section>
        <Container><Divider /></Container>

        <AuthGate>
          <section className="py-[var(--section-gap)]">
            <Container className="max-w-2xl">
              {/* Profile Card */}
              <div className="paper-card p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[var(--text)] flex items-center justify-center shrink-0">
                    <span className="text-[var(--bg2)] text-xl font-bold">
                      {(user?.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-heading truncate">{user?.name || 'User'}</h3>
                    <p className="text-caption text-sm">{user?.phone || ''}</p>
                  </div>
                  <button className="btn-ghost p-2"><Edit2 className="w-4 h-4" /></button>
                </div>
                {user?.referral_code && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <p className="text-meta text-[10px] mb-1">REFERRAL CODE</p>
                    <p className="text-sm font-mono text-[var(--text)]">{user.referral_code}</p>
                  </div>
                )}
              </div>

              {/* Menu */}
              <div className="space-y-0 mb-8">
                {menuItems.map((item, i) => (
                  <div key={item.label}>
                    <Link href={item.href} className="flex items-center gap-4 py-4 group">
                      <item.icon className="w-5 h-5 text-[var(--muted)]" />
                      <span className="text-sm font-medium text-[var(--text)] flex-1 group-hover:text-[var(--accent)] transition-colors">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-[var(--muted)]" />
                    </Link>
                    {i < menuItems.length - 1 && <Divider />}
                  </div>
                ))}
              </div>

              <Divider className="mb-8" />

              {/* Orders */}
              <SectionHeader meta="PURCHASE HISTORY" title="Recent Orders" align="left" className="mb-6" />
              {loading ? <ListSkeleton rows={3} /> : orders.length === 0 ? (
                <EmptyState icon={Package} title="No orders yet" description="Your purchases will appear here" actionLabel="Start Shopping" actionHref="/explore" />
              ) : (
                <div className="space-y-0">
                  {orders.slice(0, 10).map((order, i) => (
                    <div key={order._id}>
                      <div className="flex items-center justify-between py-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text)] truncate">Order #{order._id?.slice(-6)}</p>
                          <p className="text-meta text-[10px] mt-0.5">
                            {new Date(order.created_at || order.createdAt).toLocaleDateString()} · {order.status || 'completed'}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-[var(--text)]">{formatCurrency(order.total || order.amount || 0)}</span>
                      </div>
                      {i < Math.min(orders.length, 10) - 1 && <Divider />}
                    </div>
                  ))}
                </div>
              )}

              <Divider className="my-8" />

              {/* Logout */}
              <button onClick={handleLogout} className="btn-ghost text-[var(--danger)] text-sm w-full justify-center py-3">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </Container>
          </section>
        </AuthGate>
        <Footer />
      </MotionPage>
      <MobileNav />
    </div>
  );
}
