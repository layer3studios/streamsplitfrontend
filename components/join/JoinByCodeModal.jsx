'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowRight, Ticket } from 'lucide-react';

/**
 * JoinByCodeModal — compact modal to enter an invite code.
 * Props: isOpen, onClose
 */
export default function JoinByCodeModal({ isOpen, onClose }) {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = code.trim();
        if (!trimmed) { setError('Please enter an invite code.'); return; }
        setError('');
        router.push(`/join/${encodeURIComponent(trimmed.toUpperCase())}`);
        onClose();
        setCode('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-[var(--text)]/20 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[var(--bg)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm mx-0 sm:mx-4 shadow-2xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-[var(--muted)]" />
                        <p className="text-meta text-[10px]">JOIN BY CODE</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--surface)] transition-colors">
                        <X className="w-4 h-4 text-[var(--muted)]" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                    <input
                        type="text"
                        value={code}
                        onChange={e => { setCode(e.target.value); setError(''); }}
                        placeholder="e.g. AB12CD34EF"
                        autoFocus
                        className="w-full h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] px-4 text-lg text-center tracking-[0.15em] font-mono text-[var(--text)] placeholder:text-[var(--muted)] placeholder:tracking-[0.15em] outline-none transition-all focus:border-[var(--border2)] focus:ring-2 focus:ring-[var(--accent)]/15 uppercase"
                    />
                    {error && <p className="text-[var(--danger)] text-xs text-center">{error}</p>}
                    <button type="submit" className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
                        Continue <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-[var(--muted)] text-[10px] text-center">
                        Codes are case-insensitive. You'll preview the group before joining.
                    </p>
                </form>
            </div>
        </div>
    );
}
