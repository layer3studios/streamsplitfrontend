'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
};

const STYLES = {
    success: 'bg-[var(--surface)] border-[var(--success)] text-[var(--success)]',
    error: 'bg-[var(--surface)] border-[var(--danger)] text-[var(--danger)]',
    info: 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)]',
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        if (duration > 0) {
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toastFn = (msg, type) => addToast(msg, type);
    toastFn.success = (msg) => addToast(msg, 'success');
    toastFn.error = (msg) => addToast(msg, 'error');
    toastFn.info = (msg) => addToast(msg, 'info');

    return (
        <ToastContext.Provider value={toastFn}>
            {children}
            <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 w-full max-w-sm px-4 pointer-events-none">
                {toasts.map(t => {
                    const Icon = ICONS[t.type] || Info;
                    return (
                        <div key={t.id}
                            className={`pointer-events-auto w-full flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-up ${STYLES[t.type]}`}
                            style={{ boxShadow: 'var(--shadowSoft)' }}
                            role="alert">
                            <Icon className="w-5 h-5 shrink-0" />
                            <p className="text-sm flex-1">{t.message}</p>
                            <button onClick={() => removeToast(t.id)} className="opacity-50 hover:opacity-100 transition-opacity">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        const noop = () => { };
        noop.success = noop;
        noop.error = noop;
        noop.info = noop;
        return noop;
    }
    return ctx;
}
