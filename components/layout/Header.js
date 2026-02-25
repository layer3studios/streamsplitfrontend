'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User } from 'lucide-react';
import { useStore } from '../../lib/store';
import ThemeToggle from '../ui/ThemeToggle';
const BRAND = require('../../lib/brand');

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { isAuthenticated, user, setShowAuthModal, cartCount } = useStore();

  const navLinks = [
    { label: 'Explore', href: '/explore' },
    { label: 'Groups', href: '/groups' },
    { label: 'Wallet', href: '/wallet' },
    { label: 'Chat', href: '/chat' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/90 backdrop-blur-sm border-b border-[var(--border)]">
      <div className="max-w-[var(--page-max)] mx-auto px-[var(--page-px)]">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="font-serif text-xl text-[var(--text)]">
              {BRAND.name}
            </span>
          </Link>

          {/* Center Nav (desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[var(--muted)] text-sm font-medium hover:text-[var(--text)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Mobile Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-all"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Desktop Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search..."
                className="input pl-9 pr-4 py-2 text-sm w-44 bg-transparent"
              />
            </div>

            <ThemeToggle />

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-all"
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--accent)] text-[var(--accentFg)] text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <Link
                href="/account"
                className="flex items-center gap-2 ml-1 px-3 py-1.5 rounded-full border border-[var(--border)] hover:border-[var(--border2)] transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--text)] flex items-center justify-center">
                  <span className="text-[var(--bg2)] text-[10px] font-bold">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-[var(--text)] font-medium hidden sm:block">
                  {user?.name || 'Account'}
                </span>
              </Link>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn-primary text-xs py-2 px-4 ml-1"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden pb-3 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search brands, plans..."
                autoFocus
                className="input pl-10 pr-4 py-2.5 text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
