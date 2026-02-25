'use client';
import { useEffect } from 'react';
import { useStore } from '../lib/store';
import api from '../lib/api';

export default function AppBootstrap() {
    const { hydrate, setUser, setCart, setBrand, isAuthenticated } = useStore();

    useEffect(() => {
        // 1. Recover auth state from localStorage
        hydrate();

        // 2. Load brand config from API, apply accent color
        (async () => {
            try {
                const res = await api.getConfig();
                if (res.success && res.data) {
                    setBrand(res.data);
                    const c = res.data.colors;
                    if (c) {
                        const root = document.documentElement;
                        if (c.primary) root.style.setProperty('--accent', c.primary);
                    }
                }
            } catch (e) {
                console.warn('Config API failed, using local brand defaults');
            }
        })();
    }, []);

    // 3. When auth state is available, load user + cart
    // Guard: only call protected endpoints if we actually have a token
    useEffect(() => {
        if (!isAuthenticated) return;
        if (!api.accessToken) return;

        (async () => {
            try {
                const userRes = await api.getMe();
                if (userRes.success) {
                    setUser(userRes.data);
                    if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(userRes.data));
                    // Only load cart after user is confirmed
                    const cartRes = await api.getCart();
                    if (cartRes.success) setCart(cartRes.data);
                } else {
                    // 401 or other failure — user session invalid, clear tokens quietly
                    api.clearTokens();
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('user');
                    }
                }
            } catch (e) {
                // Network error or similar — don't spam, just warn once
                console.warn('Bootstrap: failed to load user data');
            }
        })();
    }, [isAuthenticated]);

    return null;
}
