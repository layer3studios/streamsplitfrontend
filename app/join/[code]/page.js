'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { Users, CreditCard, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import Header from '../../../components/layout/Header';
import MobileNav from '../../../components/layout/MobileNav';
import Footer from '../../../components/layout/Footer';
import AuthModal from '../../../components/ui/AuthModal';
import { MotionPage } from '../../../components/ui/Motion';
import { Container, Divider } from '../../../components/ui/Layout';
import { useStore } from '../../../lib/store';
import { formatCurrency } from '../../../lib/utils';
import api from '../../../lib/api';

export default function JoinGroupPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, setShowAuthModal, user } = useStore();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [result, setResult] = useState(null);
    const [razorpayReady, setRazorpayReady] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await api.resolveInvite(params.code);
            if (res.success) setGroup(res.data);
            else setResult({ type: 'error', message: res.message || 'Invalid invite link' });
            setLoading(false);
        })();
    }, [params.code]);

    const handleJoin = useCallback(async () => {
        if (!isAuthenticated) { setShowAuthModal(true); return; }
        setJoining(true);
        try {
            const res = await api.initiateJoin(group._id);
            if (res.success) {
                if (res.data?.razorpay_order_id && razorpayReady && window.Razorpay) {
                    const options = {
                        key: res.data.razorpay_key_id,
                        amount: res.data.amount,
                        currency: res.data.currency || 'INR',
                        order_id: res.data.razorpay_order_id,
                        name: group.name,
                        handler: async function (response) {
                            const verify = await api.verifyJoinPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
                            if (verify.success) setResult({ type: 'success', message: 'You joined the group!' });
                            else setResult({ type: 'error', message: verify.message || 'Payment verification failed' });
                        },
                        prefill: { contact: user?.phone },
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                } else {
                    setResult({ type: 'success', message: res.message || 'You joined the group!' });
                }
            } else {
                setResult({ type: 'error', message: res.message || 'Could not join group' });
            }
        } catch (e) {
            setResult({ type: 'error', message: 'Something went wrong' });
        }
        setJoining(false);
    }, [isAuthenticated, group, razorpayReady, user, setShowAuthModal]);

    const filled = group?.member_count || 0;
    const total = group?.max_members || 4;
    const isFull = filled >= total;

    return (
        <div className="min-h-screen"><Header /><AuthModal />
            <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setRazorpayReady(true)} />
            <MotionPage>
                <section className="pt-28 pb-[var(--section-gap)] md:pt-36">
                    <Container className="max-w-lg mx-auto text-center">
                        {loading ? (
                            <div className="space-y-4">
                                <div className="skeleton h-10 w-48 mx-auto rounded" />
                                <div className="skeleton h-4 w-32 mx-auto rounded" />
                                <div className="skeleton h-48 rounded-[16px] mt-8" />
                            </div>
                        ) : result ? (
                            <div className="paper-card p-10">
                                {result.type === 'success' ? (
                                    <>
                                        <CheckCircle className="w-12 h-12 text-[var(--success)] mx-auto mb-4" />
                                        <h2 className="text-display mb-2">You're In!</h2>
                                        <p className="text-caption mb-6">{result.message}</p>
                                        <button onClick={() => router.push('/groups')} className="btn-primary">View My Groups</button>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-12 h-12 text-[var(--danger)] mx-auto mb-4" />
                                        <h2 className="text-heading text-xl mb-2">Oops</h2>
                                        <p className="text-caption mb-6">{result.message}</p>
                                        <button onClick={() => router.push('/groups')} className="btn-secondary">Browse Groups</button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <p className="text-meta mb-3">JOIN GROUP</p>
                                <h1 className="text-display-huge mb-2">{group?.name}</h1>
                                <p className="text-meta text-[11px] mb-8">{group?.brand_id?.name || 'Subscription Service'}</p>

                                <div className="paper-card p-8 text-left mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-[var(--muted)]" />
                                            <span className="text-sm text-[var(--text)]">{filled}/{total} seats filled</span>
                                        </div>
                                        {isFull && <span className="badge text-[var(--danger)] border-[var(--danger)]">FULL</span>}
                                    </div>

                                    {/* Progress */}
                                    <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden mb-6">
                                        <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${(filled / total) * 100}%` }} />
                                    </div>

                                    <Divider className="mb-4" />

                                    <div className="flex items-baseline justify-between">
                                        <span className="text-meta">PRICE PER SEAT</span>
                                        <span className="font-serif text-3xl text-[var(--text)]">
                                            {formatCurrency(group?.share_price || group?.price_per_member || 0)}
                                        </span>
                                    </div>
                                </div>

                                {isFull ? (
                                    <div className="paper-card p-6 text-center">
                                        <p className="text-caption">This group is full. Try another one!</p>
                                        <button onClick={() => router.push('/groups')} className="btn-secondary mt-4 text-sm">Browse Groups</button>
                                    </div>
                                ) : (
                                    <button onClick={handleJoin} disabled={joining} className="btn-primary w-full py-3.5 text-sm">
                                        {joining ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><CreditCard className="w-4 h-4" /> Join & Pay</>}
                                    </button>
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
