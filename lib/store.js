'use client';
import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false, cart: null, cartCount: 0 }),

  // UI
  showAuthModal: false,
  setShowAuthModal: (show) => set({ showAuthModal: show }),

  // Cart
  cart: null,
  cartCount: 0,
  setCart: (cart) => set({ cart, cartCount: cart?.items?.length || 0 }),

  // Wallet
  wallet: null,
  setWallet: (wallet) => set({ wallet }),

  // Brand config (loaded from API on mount)
  brand: null,
  setBrand: (brand) => set({ brand }),

  // Init from localStorage
  hydrate: () => {
    if (typeof window === 'undefined') return;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        set({ user, isAuthenticated: true });
      }
    } catch { }
  },
}));
