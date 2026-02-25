'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Tag, ArrowRight, Package, Loader2 } from 'lucide-react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Footer from '../../components/layout/Footer';
import AuthModal from '../../components/ui/AuthModal';
import { MotionPage } from '../../components/ui/Motion';
import { Container, SectionHeader, Divider } from '../../components/ui/Layout';
import EmptyState from '../../components/ui/EmptyState';
import { ListSkeleton } from '../../components/ui/Skeleton';
import { useStore } from '../../lib/store';
import { formatCurrency } from '../../lib/utils';
import api from '../../lib/api';

export default function CartPage() {
    const { isAuthenticated, setShowAuthModal, setCart } = useStore();
    const router = useRouter();
    const [cart, setLocalCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });

    const fetchCart = useCallback(async () => {
        setLoading(true);
        const res = await api.getCart();
        if (res.success) { setLocalCart(res.data); setCart(res.data); }
        setLoading(false);
    }, [setCart]);

    useEffect(() => {
        if (!isAuthenticated) { setLoading(false); return; }
        fetchCart();
    }, [isAuthenticated, fetchCart]);

    const handleRemoveItem = async (planId) => {
        setRemoving(planId);
        const res = await api.removeFromCart(planId);
        if (res.success) { setLocalCart(res.data); setCart(res.data); }
        setRemoving(null);
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponMsg({ type: '', text: '' });
        const res = await api.applyCoupon(couponCode.trim());
        if (res.success) {
            setLocalCart(res.data); setCart(res.data);
            setCouponMsg({ type: 'success', text: `Coupon applied! You save ${formatCurrency(res.data.discount)}` });
        } else {
            setCouponMsg({ type: 'error', text: res.message || 'Invalid coupon' });
        }
        setCouponLoading(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen"><Header /><AuthModal />
                <main className="pt-24 pb-24 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <ShoppingCart className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
                        <h2 className="text-heading text-xl mb-2">Sign in to view your cart</h2>
                        <p className="text-caption mb-5">Login to add items and checkout</p>
                        <button onClick={() => setShowAuthModal(true)} className="btn-primary">Sign In</button>
                    </div>
                </main>
                <MobileNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen"><Header /><AuthModal />
            <MotionPage>
                <section className="pt-28 pb-8 md:pt-36">
                    <Container className="max-w-2xl"><SectionHeader meta="CHECKOUT" title="Your Cart" /></Container>
                </section>
                <Container className="max-w-2xl"><Divider /></Container>

                <section className="py-10">
                    <Container className="max-w-2xl">
                        {loading ? <ListSkeleton rows={3} /> : !cart || cart.items.length === 0 ? (
                            <EmptyState icon={Package} title="Your cart is empty" description="Browse plans and add items to get started" actionLabel="Explore Plans" actionHref="/explore" />
                        ) : (
                            <>
                                {/* Items */}
                                <div className="space-y-0 mb-8">
                                    {cart.items.map((item, i) => (
                                        <div key={item.plan_id}>
                                            <div className="flex items-center gap-4 py-4">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center">
                                                    <Package className="w-4 h-4 text-[var(--muted)]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-[var(--text)] truncate">{item.plan_snapshot.name}</p>
                                                    <p className="text-meta text-[10px]">{item.plan_snapshot.brand_name} · Qty: {item.quantity}</p>
                                                </div>
                                                <span className="text-sm font-medium text-[var(--text)]">{formatCurrency(item.plan_snapshot.price * item.quantity)}</span>
                                                <button
                                                    onClick={() => handleRemoveItem(item.plan_id)}
                                                    disabled={removing === item.plan_id}
                                                    className="p-2 text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
                                                >
                                                    {removing === item.plan_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {i < cart.items.length - 1 && <Divider />}
                                        </div>
                                    ))}
                                </div>

                                {/* Coupon */}
                                <div className="paper-card p-5 mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Tag className="w-4 h-4 text-[var(--muted)]" />
                                        <span className="text-sm font-medium">Apply Coupon</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text" value={couponCode}
                                            onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Enter code"
                                            className="input flex-1 text-sm uppercase"
                                        />
                                        <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                                            className="btn-primary px-5 text-xs">
                                            {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                        </button>
                                    </div>
                                    {couponMsg.text && (
                                        <p className={`text-xs mt-2 ${couponMsg.type === 'success' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{couponMsg.text}</p>
                                    )}
                                </div>

                                {/* Summary */}
                                <div className="paper-card p-5 mb-6">
                                    <p className="text-meta mb-4">ORDER SUMMARY</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-[var(--muted)]">Subtotal</span><span>{formatCurrency(cart.subtotal)}</span></div>
                                        {cart.discount > 0 && (
                                            <div className="flex justify-between"><span className="text-[var(--success)]">Discount {cart.coupon_code && `(${cart.coupon_code})`}</span><span className="text-[var(--success)]">-{formatCurrency(cart.discount)}</span></div>
                                        )}
                                        <Divider className="!my-3" />
                                        <div className="flex justify-between font-medium">
                                            <span>Total</span>
                                            <span className="font-serif text-xl">{formatCurrency(cart.total)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => router.push('/checkout')} className="btn-primary w-full py-3.5 text-sm">
                                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </Container>
                </section>
                <Footer />
            </MotionPage>
            <MobileNav />
        </div>
    );
}
