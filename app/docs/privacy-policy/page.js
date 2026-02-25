'use client';
import Link from 'next/link';
const BRAND = require('../../../lib/brand');

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen pb-24">
            <div className="relative overflow-hidden py-16 px-6">
                <div className="absolute inset-0 brand-gradient opacity-5" />
                <div className="max-w-3xl mx-auto text-center relative">
                    <h1 className="font-heading font-bold text-3xl text-[var(--text)] mb-2">Privacy Policy</h1>
                    <p className="text-[var(--muted)] text-sm">Last updated: February 2026</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 space-y-8">
                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">1. Information We Collect</h2>
                    <p className="text-[var(--muted)] text-sm leading-relaxed">
                        {BRAND.name} collects the following information when you use our platform:
                    </p>
                    <ul className="list-disc list-inside text-[var(--muted)] text-sm leading-relaxed mt-2 space-y-1 pl-2">
                        <li>Phone number (required for authentication)</li>
                        <li>Name and profile information (optional, user-provided)</li>
                        <li>Transaction and payment data (wallet top-ups, purchases)</li>
                        <li>Device information and IP address (for security)</li>
                        <li>Chat messages within group conversations</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">2. How We Use Your Information</h2>
                    <ul className="list-disc list-inside text-[var(--muted)] text-sm leading-relaxed space-y-1 pl-2">
                        <li>To authenticate your identity via OTP verification</li>
                        <li>To process transactions and manage your wallet</li>
                        <li>To facilitate group subscription sharing</li>
                        <li>To send service notifications and updates</li>
                        <li>To improve our platform and detect fraud</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">3. Data Security</h2>
                    <p className="text-[var(--muted)] text-sm leading-relaxed">
                        We use industry-standard security measures including encrypted connections (HTTPS),
                        hashed passwords and OTPs (bcrypt), JWT token-based authentication, and rate limiting
                        to protect your data. Financial transactions use atomic operations to ensure consistency.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">4. Data Sharing</h2>
                    <p className="text-[var(--muted)] text-sm leading-relaxed">
                        We do not sell or trade your personal information. We may share data with:
                    </p>
                    <ul className="list-disc list-inside text-[var(--muted)] text-sm leading-relaxed mt-2 space-y-1 pl-2">
                        <li>Payment processors (e.g., Razorpay) to process transactions</li>
                        <li>Law enforcement when required by applicable law</li>
                        <li>Other group members can see your name in shared groups</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">5. Your Rights</h2>
                    <p className="text-[var(--muted)] text-sm leading-relaxed">
                        You may request access to, correction of, or deletion of your personal data by contacting
                        us at <a href={`mailto:${BRAND.supportEmail}`} className="text-brand-primary-light hover:underline">{BRAND.supportEmail}</a>.
                        You can update your profile information at any time through the Account page.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-[var(--text)] mb-3">6. Contact</h2>
                    <p className="text-[var(--muted)] text-sm leading-relaxed">
                        For privacy-related questions, contact us at{' '}
                        <a href={`mailto:${BRAND.supportEmail}`} className="text-brand-primary-light hover:underline">{BRAND.supportEmail}</a>.
                    </p>
                </section>

                <div className="pt-6 border-t border-[var(--border)] text-center">
                    <Link href="/" className="text-brand-primary-light text-sm hover:underline">← Back to {BRAND.name}</Link>
                </div>
            </div>
        </div>
    );
}
