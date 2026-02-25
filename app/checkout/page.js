'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { CreditCard, Wallet, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Footer from '../../components/layout/Footer';
import AuthModal from '../../components/ui/AuthModal';
import { MotionPage } from '../../components/ui/Motion';
import { Container, SectionHeader, Divider } from '../../components/ui/Layout';
import { useStore } from '../../lib/store';
import { formatCurrency } from '../../lib/utils';
import api from '../../lib/api';
const BRAND = require('../../lib/brand');

export default function CheckoutPage() {
    const { isAuthenticated, setShowAuthModal, setCart, user } = useStore();
    const router = useRouter();
    const [cart, setLocalCart] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('wallet');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [razorpayReady, setRazorpayReady] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        (async () => {
            setLoading(true);
            const [cartRes, walletRes] = await Promise.all([api.getCart(), api.getWallet()]);
            if (cartRes.success) setLocalCart(cartRes.data);
            if (walletRes.success) setWallet(walletRes.data);
            setLoading(false);
        })();
    }, [isAuthenticated]);

    const openRazorpay = useCallback((rpData, orderId) => {
        if (!window.Razorpay) {
            setResult({ type: 'error', message: 'Razorpay SDK not loaded. Please refresh.' });
            setProcessing(false);
            return;
        }
        const options = {
            key: rpData.key_id, amount: rpData.amount, currency: rpData.currency,
            name: BRAND.name, description: 'Order Payment', order_id: rpData.order_id,
            prefill: { contact: user?.phone || '' },
            theme: { color: '#121212' },
            handler: async function (response) {
                setProcessing(true);
                const verifyRes = await api.verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
                setProcessing(false);
                if (verifyRes.success) {
                    setResult({ type: 'success', message: 'Payment successful! Order confirmed.' });
                    setCart(null);
                    setTimeout(() => router.push('/account'), 2000);
                } else {
                    setResult({ type: 'error', message: verifyRes.message || 'Payment verification failed' });
                }
            },
            modal: { ondismiss: () => { setProcessing(false); setResult({ type: 'error', message: 'Payment cancelled.' }); } },
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (r) => { setProcessing(false); setResult({ type: 'error', message: r.error?.description || 'Payment failed.' }); });
        rzp.open();
    }, [user, router, setCart]);

    const handleCheckout = async () => {
        setProcessing(true); setResult(null);
        const res = await api.checkout(paymentMethod);
        if (res.success) {
            if (paymentMethod === 'wallet') {
                setProcessing(false);
                setResult({ type: 'success', message: 'Order placed successfully!' });
                setCart(null);
                setTimeout(() => router.push('/account'), 2000);
            } else {
                if (res.data?.razorpay) openRazorpay(res.data.razorpay, res.data.order._id);
                else { setProcessing(false); setResult({ type: 'error', message: 'Razorpay order creation failed' }); }
            }
        } else {
            setProcessing(false);
            setResult({ type: 'error', message: res.message || 'Checkout failed' });
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen"><Header /><AuthModal />
                <main className="pt-24 pb-24 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <CreditCard className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
                        <h2 className="text-heading text-xl mb-2">Sign in to checkout</h2>
                        <button onClick={() => setShowAuthModal(true)} className="btn-primary text-sm">Sign In</button>
                    </div>
                </main>
                <MobileNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen"><Header /><AuthModal />
            <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setRazorpayReady(true)} />
            <MotionPage>
                <section className="pt-28 pb-8 md:pt-36">
                    <Container className="max-w-2xl">
                        <button onClick={() => router.push('/cart')} className="btn-ghost text-sm mb-6">
                            <ArrowLeft className="w-4 h-4" /> Back to Cart
                        </button>
                        <SectionHeader meta="PAYMENT" title="Checkout" align="left" className="mb-8" />

                        {loading ? (
                            <div className="space-y-3"><div className="skeleton h-40 rounded-[16px]" /><div className="skeleton h-32 rounded-[16px]" /></div>
                        ) : !cart || cart.items.length === 0 ? (
                            <div className="paper-card p-12 text-center">
                                <p className="text-caption mb-4">Your cart is empty</p>
                                <button onClick={() => router.push('/explore')} className="btn-primary text-sm">Browse Plans</button>
                            </div>
                        ) : (
                            <>
                                {/* Order Summary */}
                                <div className="paper-card p-5 mb-5">
                                    <p className="text-meta mb-4">ORDER SUMMARY</p>
                                    <div className="space-y-2 text-sm">
                                        {cart.items.map((item) => (
                                            <div key={item.plan_id} className="flex justify-between">
                                                <span className="text-[var(--muted)]">{item.plan_snapshot.name} × {item.quantity}</span>
                                                <span>{formatCurrency(item.plan_snapshot.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                        <Divider className="!my-3" />
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

                                {/* Payment Method */}
                                <div className="paper-card p-5 mb-5">
                                    <p className="text-meta mb-4">PAYMENT METHOD</p>
                                    <div className="space-y-2">
                                        <button onClick={() => setPaymentMethod('wallet')}
                                            className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${paymentMethod === 'wallet' ? 'border-[var(--accent)] bg-[var(--bg)]' : 'border-[var(--border)] hover:border-[var(--border2)]'}`}>
                                            <Wallet className={`w-5 h-5 ${paymentMethod === 'wallet' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{BRAND.name} Wallet</p>
                                                <p className="text-[var(--muted)] text-xs">
                                                    Balance: {formatCurrency(wallet?.balance || 0)}
                                                    {wallet && wallet.balance < cart.total && (
                                                        <span className="text-[var(--danger)] ml-2">(Insufficient — <button onClick={() => router.push('/wallet')} className="underline">Top up</button>)</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'wallet' ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border2)]'}`} />
                                        </button>

                                        <button onClick={() => setPaymentMethod('razorpay')}
                                            className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${paymentMethod === 'razorpay' ? 'border-[var(--accent)] bg-[var(--bg)]' : 'border-[var(--border)] hover:border-[var(--border2)]'}`}>
                                            <CreditCard className={`w-5 h-5 ${paymentMethod === 'razorpay' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Razorpay (UPI / Card / Net Banking)</p>
                                                <p className="text-[var(--muted)] text-xs">Pay securely via UPI, card, or net banking</p>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'razorpay' ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border2)]'}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Result */}
                                {result && (
                                    <div className={`paper-card p-4 mb-5 flex items-center gap-3 ${result.type === 'success' ? '!border-[var(--success)]' : '!border-[var(--danger)]'}`}>
                                        {result.type === 'success' ? <CheckCircle className="w-5 h-5 text-[var(--success)] shrink-0" /> : <AlertCircle className="w-5 h-5 text-[var(--danger)] shrink-0" />}
                                        <p className={`text-sm ${result.type === 'success' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{result.message}</p>
                                    </div>
                                )}

                                {/* Pay Button */}
                                <button onClick={handleCheckout}
                                    disabled={processing || (paymentMethod === 'wallet' && wallet && wallet.balance < cart.total) || (paymentMethod === 'razorpay' && !razorpayReady)}
                                    className="btn-primary w-full py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                    {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                        : paymentMethod === 'razorpay' && !razorpayReady ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading Razorpay...</>
                                            : <>Pay {formatCurrency(cart.total)}</>}
                                </button>

                                {paymentMethod === 'razorpay' && (
                                    <p className="text-meta text-center mt-3">Secured by Razorpay. Payment details are encrypted.</p>
                                )}
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
