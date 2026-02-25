'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { Users, CreditCard, CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react';
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
    const [joinIntent, setJoinIntent] = useState(null);
    const [razorpayReady, setRazorpayReady] = useState(false);

    const code = params.code;

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await api.resolveInvite(code);
            if (res.success) {
                setGroup(res.data);
            } else {
                const msg = res.error === 'EXPIRED'
                    ? 'Invite has expired — ask the group owner for a new link.'
                    : res.error === 'MAX_USES'
                        ? 'This invite has reached its usage limit.'
                        : res.message || 'Invalid invite code';
                setResult({ type: 'error', message: msg, errorCode: res.error });
            }
            setLoading(false);
        })();
    }, [code]);

    const handleJoin = useCallback(async () => {
        if (!isAuthenticated) { setShowAuthModal(true); return; }
        setJoining(true);
        try {
            const res = await api.initiateInviteJoin(code, { payment_method: razorpayReady ? 'razorpay' : 'dev' });
            if (!res.success) {
                setResult({ type: 'error', message: res.message || 'Could not join group' });
                setJoining(false);
                return;
            }

            const data = res.data;

            // Already joined (free group or wallet)
            if (data.joined) {
                setResult({ type: 'success', message: res.message || 'You joined the group!', groupId: data.group_id });
                setJoining(false);
                return;
            }

            // Razorpay checkout
            if (data.razorpay_order_id && razorpayReady && window.Razorpay) {
                const options = {
                    key: data.razorpay_key_id,
                    amount: data.amount,
                    currency: data.currency || 'INR',
                    order_id: data.razorpay_order_id,
                    name: group?.name || 'Group',
                    handler: async function (response) {
                        const verify = await api.verifyJoinPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
                        if (verify.success) setResult({ type: 'success', message: 'You joined the group!', groupId: verify.data?.group_id });
                        else setResult({ type: 'error', message: verify.message || 'Payment verification failed' });
                    },
                    prefill: { contact: user?.phone },
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
                setJoining(false);
                return;
            }

            // Dev fallback — show confirm button
            setJoinIntent(data);
            setJoining(false);
        } catch (e) {
            setResult({ type: 'error', message: 'Something went wrong' });
            setJoining(false);
        }
    }, [isAuthenticated, code, group, razorpayReady, user, setShowAuthModal]);

    const handleDevConfirm = async () => {
        if (!joinIntent) return;
        setJoining(true);
        try {
            const res = await api.confirmInviteJoin(code, joinIntent.joinIntentId);
            if (res.success) {
                setResult({ type: 'success', message: res.message || 'Joined successfully!', groupId: res.data?.group_id });
            } else {
                setResult({ type: 'error', message: res.message || 'Join failed' });
            }
        } catch (e) {
            setResult({ type: 'error', message: 'Confirmation failed' });
        }
        setJoining(false);
    };

    const filled = group?.member_count || 0;
    const total = group?.max_members || group?.share_limit || 4;
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
                                        {result.errorCode === 'EXPIRED' ? (
                                            <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                        ) : (
                                            <AlertCircle className="w-12 h-12 text-[var(--danger)] mx-auto mb-4" />
                                        )}
                                        <h2 className="text-heading text-xl mb-2">
                                            {result.errorCode === 'EXPIRED' ? 'Invite Expired' : 'Oops'}
                                        </h2>
                                        <p className="text-caption mb-6">{result.message}</p>
                                        <button onClick={() => router.push('/groups')} className="btn-secondary">Browse Groups</button>
                                    </>
                                )}
                            </div>
                        ) : joinIntent ? (
                            /* Dev confirm step */
                            <div className="paper-card p-8">
                                <p className="text-meta mb-3">DEV PAYMENT CONFIRMATION</p>
                                <h2 className="text-heading text-xl mb-2">{group?.name}</h2>
                                <p className="text-caption mb-6">
                                    Amount: {formatCurrency(joinIntent.amount)} · Payment: {joinIntent.payment_method}
                                </p>
                                <button onClick={handleDevConfirm} disabled={joining}
                                    className="btn-primary w-full py-3.5 text-sm">
                                    {joining ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</> : '✅ Confirm Payment (Dev)'}
                                </button>
                                <p className="text-[9px] text-[var(--muted)] mt-3">This button only appears in development mode</p>
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

                                    <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden mb-6">
                                        <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${(filled / total) * 100}%` }} />
                                    </div>

                                    <Divider className="mb-4" />

                                    <div className="flex items-baseline justify-between">
                                        <span className="text-meta">PRICE PER SEAT</span>
                                        <span className="font-serif text-3xl text-[var(--text)]">
                                            {formatCurrency(group?.share_price || 0)}
                                        </span>
                                    </div>

                                    {group?.owner && (
                                        <p className="text-[10px] text-[var(--muted)] mt-3">Hosted by {group.owner.name}</p>
                                    )}
                                </div>

                                {isFull ? (
                                    <div className="paper-card p-6 text-center">
                                        <p className="text-caption">This group is full. Try another one!</p>
                                        <button onClick={() => router.push('/groups')} className="btn-secondary mt-4 text-sm">Browse Groups</button>
                                    </div>
                                ) : (
                                    <button onClick={handleJoin} disabled={joining} className="btn-primary w-full py-3.5 text-sm">
                                        {joining
                                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                            : <><CreditCard className="w-4 h-4" /> {(group?.share_price || 0) === 0 ? 'Join for Free' : 'Join & Pay'}</>}
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
