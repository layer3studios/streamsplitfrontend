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
                        // Only apply accent — base paper palette stays fixed
                        if (c.primary) root.style.setProperty('--accent', c.primary);
                    }
                }
            } catch (e) {
                console.warn('Config API failed, using local brand defaults');
            }
        })();
    }, []);

    // 3. When auth state is available, load user + cart
    useEffect(() => {
        if (!isAuthenticated) return;
        if (!api.accessToken) return;

        (async () => {
            try {
                const [userRes, cartRes] = await Promise.all([api.getMe(), api.getCart()]);
                if (userRes.success) {
                    setUser(userRes.data);
                    if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(userRes.data));
                }
                if (cartRes.success) setCart(cartRes.data);
            } catch (e) {
                console.warn('Failed to load user/cart data');
            }
        })();
    }, [isAuthenticated]);

    return null;
}
