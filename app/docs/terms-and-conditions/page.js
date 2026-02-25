'use client';
import Link from 'next/link';
const BRAND = require('../../../lib/brand');

export default function TermsPage() {
    return (
        <div className="min-h-screen pb-24">
            <div className="relative overflow-hidden py-16 px-6">
                <div className="absolute inset-0 brand-gradient opacity-5" />
                <div className="max-w-3xl mx-auto text-center relative">
                    <h1 className="font-heading font-bold text-3xl text-[var(--text)] mb-2">Terms &amp; Conditions</h1>
                    <p className="text-[var(--muted)] text-sm">Last updated: February 2026</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 space-y-8">
                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">1. Acceptance of Terms</h2>
                    <p className="text-[var(--muted)] text-sm leading-relaxed">
                        By accessing or using {BRAND.name} ({BRAND.domain}), you agree to be bound by these Terms and Conditions.
                        If you do not agree, please do not use our platform.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">2. Account Registration</h2>
                    <p className="text-[var(--muted)] text-sm leading-relaxed">
                        You must provide a valid phone number to create an account. You are responsible for maintaining
                        the confidentiality of your account and all activities under it. You must be at least 18 years old.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">3. Subscription Sharing</h2>
                    <p className="text-[var(--muted)] text-sm leading-relaxed">
                        {BRAND.name} facilitates subscription cost sharing among users. We do not guarantee the
                        availability or performance of third-party subscription services. Users are responsible for
                        complying with the terms of the underlying subscription services they join.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">4. Payments &amp; Wallet</h2>
                    <ul className="list-disc list-inside text-[var(--muted)] text-sm leading-relaxed space-y-1 pl-2">
                        <li>Wallet top-ups are processed securely through our payment partners</li>
                        <li>All purchases are final unless explicitly stated otherwise in our Refund Policy</li>
                        <li>Wallet balances are non-transferable between accounts</li>
                        <li>Minimum top-up: {BRAND.currency.symbol}{BRAND.wallet.minTopup} · Maximum: {BRAND.currency.symbol}{BRAND.wallet.maxTopup}</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">5. Prohibited Conduct</h2>
                    <ul className="list-disc list-inside text-[var(--muted)] text-sm leading-relaxed space-y-1 pl-2">
                        <li>Using the platform for fraudulent or illegal purposes</li>
                        <li>Attempting to bypass security measures or access other users&apos; accounts</li>
                        <li>Sharing offensive, harmful, or inappropriate content in group chats</li>
                        <li>Creating multiple accounts or automating access</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">6. Termination</h2>
                    <p className="text-[var(--muted)] text-sm leading-relaxed">
                        We reserve the right to suspend or terminate accounts that violate these terms. You may
                        delete your account by contacting <a href={`mailto:${BRAND.supportEmail}`} className="text-brand-primary-light hover:underline">{BRAND.supportEmail}</a>.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">7. Limitation of Liability</h2>
                    <p className="text-[var(--muted)] text-sm leading-relaxed">
                        {BRAND.name} is provided &quot;as is&quot; without warranties. We are not liable for any indirect,
                        incidental, or consequential damages arising from use of the platform.
                    </p>
                </section>

                <div className="pt-6 border-t border-[var(--border)] text-center">
                    <Link href="/" className="text-brand-primary-light text-sm hover:underline">← Back to {BRAND.name}</Link>
                </div>
            </div>
        </div>
    );
}
