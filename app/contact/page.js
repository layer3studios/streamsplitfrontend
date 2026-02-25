'use client';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
const BRAND = require('../../lib/brand');

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // In production, wire to backend contact endpoint
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen pb-24">
            <div className="relative overflow-hidden py-16 px-6">
                <div className="absolute inset-0 brand-gradient opacity-5" />
                <div className="max-w-3xl mx-auto text-center relative">
                    <h1 className="font-heading font-bold text-3xl sm:text-4xl text-white mb-4">Contact Us</h1>
                    <p className="text-gray-400 text-lg">We&apos;d love to hear from you</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Contact Info */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="card p-5 hover:transform-none">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-brand-primary-light" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">Email</p>
                                    <a href={`mailto:${BRAND.supportEmail}`} className="text-brand-primary-light text-sm hover:underline">
                                        {BRAND.supportEmail}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="card p-5 hover:transform-none">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">Phone</p>
                                    <p className="text-gray-400 text-sm">Available on WhatsApp</p>
                                </div>
                            </div>
                        </div>

                        <div className="card p-5 hover:transform-none">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">Domain</p>
                                    <p className="text-gray-400 text-sm">{BRAND.domain}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-3">
                        {submitted ? (
                            <div className="card p-8 text-center hover:transform-none">
                                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                                <h3 className="font-heading font-bold text-lg text-white mb-2">Message Sent!</h3>
                                <p className="text-gray-500 text-sm">We&apos;ll get back to you at {form.email || 'your email'} soon.</p>
                                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); }}
                                    className="text-brand-primary-light text-sm hover:underline mt-4 inline-block">
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="card p-6 hover:transform-none space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Your Name</label>
                                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="John Doe" className="input py-2.5" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="john@example.com" className="input py-2.5" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Message</label>
                                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        placeholder="How can we help?" rows={4} className="input py-2.5 resize-none" required />
                                </div>
                                <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm">
                                    <Send className="w-4 h-4" /> Send Message
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
