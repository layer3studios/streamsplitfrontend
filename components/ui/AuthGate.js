'use client';
import { useStore } from '../../lib/store';

// Auth gate: children render only when authenticated; otherwise shows sign-in prompt
export default function AuthGate({ children }) {
    const { isAuthenticated, setShowAuthModal } = useStore();

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-xs">
                    <div className="w-14 h-14 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mx-auto mb-5">
                        <span className="font-serif text-xl text-[var(--text)]">?</span>
                    </div>
                    <h2 className="text-heading text-lg mb-1">Sign in to continue</h2>
                    <p className="text-caption mb-5">You need to be logged in to access this page.</p>
                    <button onClick={() => setShowAuthModal(true)} className="btn-primary text-sm">Sign In</button>
                </div>
            </div>
        );
    }

    return children;
}
