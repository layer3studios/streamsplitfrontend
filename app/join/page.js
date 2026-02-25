'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Footer from '../../components/layout/Footer';
import AuthModal from '../../components/ui/AuthModal';
import { MotionPage } from '../../components/ui/Motion';
import { Container, SectionHeader, Divider } from '../../components/ui/Layout';

export default function JoinPage() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = code.trim();
        if (!trimmed) {
            setError('Please enter an invite code.');
            return;
        }
        setError('');
        router.push(`/join/${trimmed}`);
    };

    return (
        <div className="min-h-screen">
            <Header /><AuthModal />
            <MotionPage>
                <section className="pt-28 pb-[var(--section-gap)] md:pt-36">
                    <Container className="max-w-md mx-auto">
                        <SectionHeader meta="JOIN" title="Join with code" subtitle="Paste an invite code to view the group." />

                        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
                            <div className="paper-card p-6 md:p-8">
                                <label className="text-meta text-[10px] block mb-2">INVITE CODE</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={e => { setCode(e.target.value); setError(''); }}
                                    placeholder="e.g. AB12CD34"
                                    autoFocus
                                    className="w-full h-12 rounded-xl bg-[var(--bg)] border border-[var(--border)] px-4 text-lg text-center tracking-[0.15em] font-mono text-[var(--text)] placeholder:text-[var(--muted)] placeholder:tracking-[0.15em] outline-none transition-all focus:border-[var(--border2)] focus:ring-2 focus:ring-[var(--accent)]/15 uppercase"
                                />
                                {error && (
                                    <p className="text-[var(--danger)] text-xs mt-2">{error}</p>
                                )}
                                <p className="text-[var(--muted)] text-[11px] mt-3">
                                    Codes are case-insensitive. You'll see the group details before joining.
                                </p>
                            </div>

                            <button type="submit" className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2">
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>

                        <Divider className="my-10" />

                        <div className="text-center">
                            <p className="text-caption text-sm mb-3">Don't have a code?</p>
                            <button onClick={() => router.push('/groups')} className="btn-secondary text-sm">
                                Browse Public Groups
                            </button>
                        </div>
                    </Container>
                </section>
                <Footer />
            </MotionPage>
            <MobileNav />
        </div>
    );
}
