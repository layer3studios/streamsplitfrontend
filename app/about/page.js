'use client';
import Link from 'next/link';
import { Mail, MapPin, Phone, Globe, Send } from 'lucide-react';
const BRAND = require('../../lib/brand');

export default function AboutPage() {
    return (
        <div className="min-h-screen pb-24">
            {/* Hero */}
            <div className="relative overflow-hidden py-16 px-6">
                <div className="absolute inset-0 brand-gradient opacity-5" />
                <div className="max-w-3xl mx-auto text-center relative">
                    <h1 className="font-heading font-bold text-3xl sm:text-4xl text-white mb-4">About {BRAND.name}</h1>
                    <p className="text-gray-400 text-lg leading-relaxed">{BRAND.description}</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 space-y-12">
                {/* Mission */}
                <section>
                    <h2 className="font-heading font-bold text-xl text-white mb-4">Our Mission</h2>
                    <p className="text-gray-400 leading-relaxed">
                        At {BRAND.name}, we believe premium digital subscriptions shouldn&apos;t be expensive. Our platform
                        lets you share subscription costs with trusted groups, making services like Netflix, Spotify,
                        and YouTube Premium affordable for everyone.
                    </p>
                    <p className="text-gray-400 leading-relaxed mt-3">
                        We&apos;ve built a secure, transparent platform where you can browse plans, join sharing groups,
                        and manage your subscriptions — all in one place.
                    </p>
                </section>

                {/* How it works */}
                <section>
                    <h2 className="font-heading font-bold text-xl text-white mb-4">How It Works</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { step: '01', title: 'Browse', desc: 'Explore 12+ brands across 8 categories with discounted plans.' },
                            { step: '02', title: 'Share', desc: 'Join a sharing group or create your own to split subscription costs.' },
                            { step: '03', title: 'Save', desc: 'Pay a fraction of the price and enjoy full premium access.' },
                        ].map(s => (
                            <div key={s.step} className="card p-5 hover:transform-none">
                                <span className="text-brand-primary-light font-heading font-bold text-2xl">{s.step}</span>
                                <h3 className="text-white font-semibold mt-2 mb-1">{s.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section>
                    <h2 className="font-heading font-bold text-xl text-white mb-4">Key Features</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            'Secure phone OTP authentication',
                            'Wallet system with instant top-up',
                            'Real-time group chat with Socket.IO',
                            'Coupon & discount system',
                            'Group subscription sharing',
                            'Premium dark UI with glassmorphism',
                        ].map(f => (
                            <div key={f} className="flex items-center gap-2.5 p-3 bg-white/2 rounded-xl">
                                <div className="w-2 h-2 rounded-full brand-gradient shrink-0" />
                                <span className="text-gray-400 text-sm">{f}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="text-center py-8">
                    <p className="text-gray-500 text-sm mb-3">Have questions?</p>
                    <Link href="/contact" className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2">
                        <Send className="w-4 h-4" /> Contact Us
                    </Link>
                </section>
            </div>
        </div>
    );
}
