'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Copy, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
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

export default function CreateGroupPage() {
    const { isAuthenticated, setShowAuthModal } = useStore();
    const router = useRouter();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState(null);
    const [copied, setCopied] = useState(false);
    const [form, setForm] = useState({
        name: '', description: '', brand_id: '', share_price: '', total_price: '',
        share_limit: 5, duration_days: 30, is_public: true,
    });
    const [pricingMode, setPricingMode] = useState('total'); // 'total' or 'per_seat'
    const [error, setError] = useState('');

    const computedSharePrice = pricingMode === 'total' && form.total_price && form.share_limit
        ? Math.ceil(parseFloat(form.total_price) / parseInt(form.share_limit))
        : null;

    useEffect(() => {
        api.getBrands().then(r => { if (r.success) setBrands(r.data?.brands || r.data || []); });
    }, []);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen"><Header /><AuthModal />
                <main className="pt-24 pb-24 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Plus className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
                        <h2 className="text-heading text-xl mb-2">Sign in to create groups</h2>
                        <button onClick={() => setShowAuthModal(true)} className="btn-primary text-sm">Sign In</button>
                    </div>
                </main>
                <MobileNav />
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalPrice = pricingMode === 'total' ? computedSharePrice : parseFloat(form.share_price);
        if (!form.name || !finalPrice || finalPrice <= 0) {
            return setError('Name and price are required');
        }
        setLoading(true); setError('');
        const res = await api.createGroup({
            name: form.name, description: form.description,
            brand_id: form.brand_id || undefined,
            share_price: finalPrice,
            share_limit: parseInt(form.share_limit),
            duration_days: parseInt(form.duration_days),
            is_public: form.is_public,
        });
        setLoading(false);
        if (res.success) setCreated(res.data);
        else setError(res.message || 'Failed to create group');
    };

    const inviteUrl = created ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${created.invite_code}` : '';

    const copyLink = () => {
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen"><Header /><AuthModal />
            <MotionPage>
                <section className="pt-28 pb-8 md:pt-36">
                    <Container className="max-w-lg">
                        <button onClick={() => router.push('/groups')} className="btn-ghost text-sm mb-6">
                            <ArrowLeft className="w-4 h-4" /> Back to Groups
                        </button>

                        <SectionHeader meta="NEW GROUP" title="Create a Group" align="left" className="mb-8" />

                        {created ? (
                            <div className="paper-card p-6 space-y-5">
                                <div className="text-center">
                                    <CheckCircle className="w-14 h-14 text-[var(--success)] mx-auto mb-3" />
                                    <h2 className="text-heading text-lg mb-1">Group Created!</h2>
                                    <p className="text-caption">Share this invite link with your members</p>
                                </div>
                                <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 flex items-center gap-2">
                                    <input readOnly value={inviteUrl} className="flex-1 bg-transparent text-[var(--text)] text-sm outline-none" />
                                    <button onClick={copyLink} className="btn-primary px-3 py-1.5 text-xs">
                                        {copied ? <><CheckCircle className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                                    </button>
                                </div>
                                <div className="paper-card p-4 space-y-1 text-sm">
                                    <div className="flex justify-between"><span className="text-[var(--muted)]">Price per seat</span><span>{formatCurrency(created.share_price)}</span></div>
                                    <div className="flex justify-between"><span className="text-[var(--muted)]">Seats</span><span>{created.share_limit}</span></div>
                                    <div className="flex justify-between"><span className="text-[var(--muted)]">Status</span><span className="capitalize text-[var(--success)]">{created.status}</span></div>
                                </div>
                                <button onClick={() => router.push('/groups')} className="btn-primary w-full py-3 text-sm">View My Groups</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="paper-card p-6 space-y-4">
                                <div>
                                    <label className="block text-meta mb-2">GROUP NAME *</label>
                                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Netflix Family Share" className="input" required />
                                </div>
                                <div>
                                    <label className="block text-meta mb-2">DESCRIPTION</label>
                                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                        placeholder="Describe what you're sharing..." rows={2} className="input resize-none" />
                                </div>
                                <div>
                                    <label className="block text-meta mb-2">BRAND (OPTIONAL)</label>
                                    <select value={form.brand_id} onChange={e => setForm({ ...form, brand_id: e.target.value })} className="input">
                                        <option value="">None</option>
                                        {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-meta">PRICING MODE</label>
                                            <div className="flex bg-[var(--bg)] border border-[var(--border)] rounded-lg overflow-hidden text-[10px]">
                                                <button type="button" onClick={() => setPricingMode('total')}
                                                    className={`px-2.5 py-1 transition-colors ${pricingMode === 'total' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)]'}`}>
                                                    Total Price
                                                </button>
                                                <button type="button" onClick={() => setPricingMode('per_seat')}
                                                    className={`px-2.5 py-1 transition-colors ${pricingMode === 'per_seat' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)]'}`}>
                                                    Per Seat
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {pricingMode === 'total' ? (
                                        <div>
                                            <label className="block text-meta mb-2">TOTAL SUBSCRIPTION PRICE *</label>
                                            <input type="number" min="1" value={form.total_price}
                                                onChange={e => setForm({ ...form, total_price: e.target.value })}
                                                placeholder="e.g. 499" className="input" required />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-meta mb-2">PRICE PER SEAT *</label>
                                            <input type="number" min="1" value={form.share_price}
                                                onChange={e => setForm({ ...form, share_price: e.target.value })}
                                                placeholder="99" className="input" required />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-meta mb-2">MAX MEMBERS</label>
                                        <input type="number" min="2" max="20" value={form.share_limit}
                                            onChange={e => setForm({ ...form, share_limit: e.target.value })} className="input" />
                                    </div>
                                </div>

                                {pricingMode === 'total' && computedSharePrice > 0 && (
                                    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 text-xs space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-[var(--muted)]">Total price</span>
                                            <span>{formatCurrency(parseFloat(form.total_price))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[var(--muted)]">÷ {form.share_limit} members</span>
                                            <span className="font-medium text-[var(--text)]">{formatCurrency(computedSharePrice)}/seat</span>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-meta mb-2">DURATION (DAYS)</label>
                                    <input type="number" min="7" value={form.duration_days}
                                        onChange={e => setForm({ ...form, duration_days: e.target.value })} className="input" />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.is_public}
                                        onChange={e => setForm({ ...form, is_public: e.target.checked })}
                                        className="w-4 h-4 rounded accent-[var(--accent)]" />
                                    <span className="text-caption text-sm">Make this group publicly visible</span>
                                </label>

                                <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--muted)]">
                                    Platform fee: {BRAND.platformCutPercent}% per seat purchase · You earn {100 - BRAND.platformCutPercent}%
                                </div>

                                {error && <p className="text-[var(--danger)] text-xs">{error}</p>}

                                <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm disabled:opacity-50">
                                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Plus className="w-4 h-4" /> Create Group</>}
                                </button>
                            </form>
                        )}
                    </Container>
                </section>
                <Footer />
            </MotionPage>
            <MobileNav />
        </div>
    );
}
