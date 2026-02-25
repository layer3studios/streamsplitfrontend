'use client';
import Link from 'next/link';
const BRAND = require('../../../lib/brand');

export default function ShippingPolicyPage() {
    return (
        <div className="min-h-screen pb-24">
            <div className="relative overflow-hidden py-16 px-6">
                <div className="absolute inset-0 brand-gradient opacity-5" />
                <div className="max-w-3xl mx-auto text-center relative">
                    <h1 className="font-heading font-bold text-3xl text-white mb-2">Shipping &amp; Delivery Policy</h1>
                    <p className="text-gray-500 text-sm">Last updated: February 2026</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 space-y-8">
                <section>
                    <h2 className="font-heading font-semibold text-lg text-white mb-3">1. Digital Delivery</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        {BRAND.name} is a digital subscription platform. All products and services are delivered
                        electronically — there are no physical goods shipped.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-white mb-3">2. Delivery Timeframe</h2>
                    <ul className="list-disc list-inside text-gray-400 text-sm leading-relaxed space-y-1 pl-2">
                        <li><strong className="text-white">Wallet top-ups:</strong> Instant after successful payment</li>
                        <li><strong className="text-white">Subscription plans:</strong> Activated within minutes to 24 hours of purchase</li>
                        <li><strong className="text-white">Group memberships:</strong> Immediate upon joining</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-white mb-3">3. Delivery Confirmation</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Once your subscription plan is activated, you will see the order status updated to
                        &quot;Fulfilled&quot; in your Account page. Wallet transactions are reflected immediately
                        in your Wallet page.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading font-semibold text-lg text-white mb-3">4. Delivery Issues</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        If your subscription is not delivered within 24 hours of purchase, please contact us at{' '}
                        <a href={`mailto:${BRAND.supportEmail}`} className="text-brand-primary-light hover:underline">{BRAND.supportEmail}</a>{' '}
                        with your order number. We will investigate and resolve the issue promptly.
                    </p>
                </section>

                <div className="pt-6 border-t border-dark-border text-center">
                    <Link href="/" className="text-brand-primary-light text-sm hover:underline">← Back to {BRAND.name}</Link>
                </div>
            </div>
        </div>
    );
}
