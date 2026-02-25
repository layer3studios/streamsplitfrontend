'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Clock, Check, Loader2, Package } from 'lucide-react';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import MobileNav from '../../../components/layout/MobileNav';
import AuthModal from '../../../components/ui/AuthModal';
import { MotionPage } from '../../../components/ui/Motion';
import { Container, Divider, SectionHeader } from '../../../components/ui/Layout';
import { useStore } from '../../../lib/store';
import { formatCurrency } from '../../../lib/utils';
import api from '../../../lib/api';

export default function BrandDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, setShowAuthModal, setCart } = useStore();
    const [brand, setBrand] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingPlan, setAddingPlan] = useState(null);
    const [addedPlan, setAddedPlan] = useState(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const brandRes = await api.getBrand(params.slug);
            if (brandRes.success && brandRes.data) {
                setBrand(brandRes.data);
                const plansRes = await api.getPlans({ brand_id: brandRes.data._id });
                if (plansRes.success) setPlans(plansRes.data);
            }
            setLoading(false);
        })();
    }, [params.slug]);

    const handleAddToCart = async (planId) => {
        if (!isAuthenticated) { setShowAuthModal(true); return; }
        setAddingPlan(planId);
        const res = await api.addToCart(planId);
        if (res.success) {
            setCart(res.data);
            setAddedPlan(planId);
            setTimeout(() => setAddedPlan(null), 2000);
        }
        setAddingPlan(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen"><Header /><AuthModal />
                <main className="pt-24 pb-24"><Container className="max-w-4xl">
                    <div className="skeleton h-8 w-32 rounded mb-12" />
                    <div className="skeleton h-20 w-80 rounded mb-4" />
                    <div className="skeleton h-4 w-64 rounded mb-12" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="skeleton h-52 rounded-[16px]" />)}
                    </div>
                </Container></main><MobileNav />
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="min-h-screen"><Header /><AuthModal />
                <main className="pt-24 pb-24 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Package className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
                        <h2 className="text-heading text-xl mb-2">Brand not found</h2>
                        <Link href="/explore" className="btn-ghost text-sm">Back to Explore</Link>
                    </div>
                </main><MobileNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen"><Header /><AuthModal />
            <MotionPage>
                <main className="pt-24 pb-32">
                    <Container className="max-w-4xl">
                        <button onClick={() => router.push('/explore')} className="btn-ghost text-sm mb-10">
                            <ArrowLeft className="w-4 h-4" /> Back to Explore
                        </button>

                        {/* Brand Header */}
                        <div className="mb-12">
                            <div className="flex items-start gap-5">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center overflow-hidden shrink-0">
                                    {brand.logo_url ? (
                                        <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain p-3" />
                                    ) : (
                                        <span className="font-serif text-3xl text-[var(--text)]">{brand.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    {brand.category_id && (
                                        <p className="text-meta text-[10px] mb-2">{brand.category_id.name}</p>
                                    )}
                                    <h1 className="text-display-huge leading-none">{brand.name}</h1>
                                    {brand.is_featured && <span className="badge badge-active text-[10px] mt-2 inline-block">FEATURED</span>}
                                </div>
                            </div>
                            {brand.description && (
                                <p className="text-caption text-base mt-6 max-w-2xl">{brand.description}</p>
                            )}
                            {brand.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {brand.tags.map(tag => <span key={tag} className="badge text-[10px]">{tag}</span>)}
                                </div>
                            )}
                        </div>

                        <Divider className="mb-12" />

                        {/* Plans */}
                        <SectionHeader meta={`${plans.length} PLANS AVAILABLE`} title="Choose a Plan" align="left" className="mb-8" />

                        {plans.length === 0 ? (
                            <div className="paper-card p-12 text-center">
                                <p className="text-caption">No plans available for this brand yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {plans.map(plan => {
                                    const discount = plan.original_price ? Math.round((1 - plan.price / plan.original_price) * 100) : 0;
                                    return (
                                        <div key={plan._id} className="paper-card p-6 flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-heading">{plan.name}</h3>
                                                {discount > 0 && (
                                                    <span className="badge text-[10px] text-[var(--success)] border-[var(--success)]">{discount}% OFF</span>
                                                )}
                                            </div>
                                            {plan.description && (
                                                <p className="text-caption text-sm flex-1 mb-4">{plan.description}</p>
                                            )}
                                            <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-4 pt-3 border-t border-[var(--border)]">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{plan.validity_days} days · {plan.type}</span>
                                            </div>
                                            <div className="flex items-baseline gap-2 mb-5">
                                                <span className="font-serif text-3xl text-[var(--text)]">{formatCurrency(plan.price)}</span>
                                                {plan.original_price && (
                                                    <span className="text-[var(--muted)] line-through text-sm">{formatCurrency(plan.original_price)}</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleAddToCart(plan._id)}
                                                disabled={addingPlan === plan._id}
                                                className={`btn-primary w-full py-3 text-xs mt-auto ${addedPlan === plan._id ? '!bg-[var(--success)] !border-[var(--success)]' : ''
                                                    }`}
                                            >
                                                {addingPlan === plan._id ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                                                ) : addedPlan === plan._id ? (
                                                    <><Check className="w-4 h-4" /> Added</>
                                                ) : (
                                                    <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Container>
                </main>
                <Footer />
            </MotionPage>
            <MobileNav />
        </div>
    );
}
