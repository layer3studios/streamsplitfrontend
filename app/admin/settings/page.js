'use client';
import { useState, useEffect } from 'react';
import { Settings, Globe, Palette, Shield, Bell, Smartphone } from 'lucide-react';
import api from '../../../lib/api';
const BRAND = require('../../../lib/brand');

export default function AdminSettingsPage() {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const res = await api.getConfig();
            if (res.success) setConfig(res.data);
            setLoading(false);
        })();
    }, []);

    if (loading) {
        return (
            <div>
                <div className="skeleton h-8 w-48 rounded-xl mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    const sections = [
        {
            icon: Globe, title: 'Platform',
            items: [
                { label: 'Name', value: config?.name },
                { label: 'Slug', value: config?.slug },
                { label: 'Domain', value: config?.domain },
                { label: 'Tagline', value: config?.tagline },
                { label: 'Currency', value: `${config?.currency?.symbol} (${config?.currency?.code})` },
            ],
        },
        {
            icon: Palette, title: 'Theme',
            items: [
                { label: 'Primary', value: config?.colors?.primary, isColor: true },
                { label: 'Secondary', value: config?.colors?.secondary, isColor: true },
                { label: 'Accent', value: config?.colors?.accent, isColor: true },
                { label: 'Heading Font', value: config?.fonts?.heading },
                { label: 'Body Font', value: config?.fonts?.body },
            ],
        },
        {
            icon: Shield, title: 'Features',
            items: [
                { label: 'WhatsApp Login', value: config?.features?.whatsappLogin ? 'Enabled' : 'Disabled' },
                { label: 'Group Chat', value: config?.features?.groupChat ? 'Enabled' : 'Disabled' },
                { label: 'Referral System', value: config?.features?.referralSystem ? 'Enabled' : 'Disabled' },
                { label: 'Wallet System', value: config?.features?.walletSystem ? 'Enabled' : 'Disabled' },
            ],
        },
        {
            icon: Smartphone, title: 'App Links',
            items: [
                { label: 'Play Store', value: config?.appLinks?.playStore || 'Not set' },
                { label: 'App Store', value: config?.appLinks?.appStore || 'Not set' },
            ],
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Platform Settings</h1>
                <p className="text-[var(--muted)] text-sm mt-1">Configuration loaded from <code className="text-[var(--muted)]">brand.config.js</code></p>
            </div>

            <div className="space-y-4">
                {sections.map(({ icon: Icon, title, items }) => (
                    <div key={title} className="card p-5 hover:transform-none">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-brand-primary-light" />
                            </div>
                            <h3 className="font-heading font-semibold text-[var(--text)]">{title}</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {items.map(({ label, value, isColor }) => (
                                <div key={label} className="flex items-center justify-between p-3 bg-white/2 rounded-xl">
                                    <span className="text-[var(--muted)] text-sm">{label}</span>
                                    <div className="flex items-center gap-2">
                                        {isColor && value && <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: value }} />}
                                        <span className="text-[var(--text)] text-sm font-medium">{value || '—'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 border border-dashed border-[var(--border)] rounded-xl text-center">
                <p className="text-[var(--muted)] text-sm">
                    Settings are currently read-only. Edit <code className="text-[var(--muted)]">brand.config.js</code> to update platform configuration.
                </p>
            </div>
        </div>
    );
}
