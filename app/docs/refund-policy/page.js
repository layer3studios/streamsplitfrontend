'use client';
import Link from 'next/link';
const BRAND = require('../../../lib/brand');

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen pb-24">
            <div className="relative overflow-hidden py-16 px-6">
                <div className="absolute inset-0 brand-gradient opacity-5" />
                <div className="max-w-3xl mx-auto text-center relative">
                    <h1 className="font-heading font-bold text-3xl text-[var(--text)] mb-2">Refund Policy</h1>
                    <p className="text-[var(--muted)] text-sm">Last updated: February 2026</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 space-y-8">
                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">1. Refund Eligibility</h2>
                    <p className="text-[var(--muted)] text-sm leading-relaxed">
                        {BRAND.name} offers refunds under the following conditions:
                    </p>
                    <ul className="list-disc list-inside text-[var(--muted)] text-sm leading-relaxed mt-2 space-y-1 pl-2">
                        <li>Subscription plan was not activated or delivered within 24 hours of purchase</li>
                        <li>Duplicate charges or technical payment errors</li>
                        <li>Service unavailability caused by {BRAND.name} (not the subscription provider)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">2. Non-Refundable Items</h2>
                    <ul className="list-disc list-inside text-[var(--muted)] text-sm leading-relaxed space-y-1 pl-2">
                        <li>Successfully delivered and activated subscriptions</li>
                        <li>Wallet top-up amounts (can be used for future purchases)</li>
                        <li>Orders cancelled after subscription activation</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">3. How to Request a Refund</h2>
                    <p className="text-[var(--muted)] text-sm leading-relaxed">
                        To request a refund, contact us at{' '}
                        <a href={`mailto:${BRAND.supportEmail}`} className="text-brand-primary-light hover:underline">{BRAND.supportEmail}</a>{' '}
                        with your order number and reason for the refund. We aim to process all refund requests
                        within 5–7 business days.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">4. Refund Method</h2>
                    <p className="text-[var(--muted)] text-sm leading-relaxed">
                        Approved refunds will be credited to your {BRAND.name} wallet. In exceptional cases,
                        refunds may be processed to the original payment method within 7–10 business days.
                    </p>
                </section>

                <div className="pt-6 border-t border-[var(--border)] text-center">
                    <Link href="/" className="text-brand-primary-light text-sm hover:underline">← Back to {BRAND.name}</Link>
                </div>
            </div>
        </div>
    );
}
