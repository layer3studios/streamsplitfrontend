'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ShoppingCart, X, Command } from 'lucide-react';
import { useStore } from '../../lib/store';
import ThemeToggle from '../ui/ThemeToggle';
import SearchModal from '../ui/SearchModal';
const BRAND = require('../../lib/brand');

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, user, setShowAuthModal, cartCount } = useStore();
  const [showSearch, setShowSearch] = useState(false);

  const navLinks = [
    { label: 'Explore', href: '/explore' },
    { label: 'Groups', href: '/groups' },
    { label: 'Wallet', href: '/wallet' },
    { label: 'Chat', href: '/chat' },
  ];

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setShowSearch(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Cmd/Ctrl+K to open
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(s => !s);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/90 backdrop-blur-sm border-b border-[var(--border)]">
        <div className="max-w-[var(--page-max)] mx-auto px-[var(--page-px)]">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="font-serif text-xl text-[var(--text)]">{BRAND.name}</span>
            </Link>

            {/* Center Nav (desktop) */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}
                  className="text-[var(--muted)] text-sm font-medium hover:text-[var(--text)] transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1">

              {/* Desktop Search — opens unified modal */}
              <button onClick={() => setShowSearch(true)}
                className="hidden md:flex items-center gap-2 h-[38px] w-44 lg:w-56 rounded-full border border-[var(--border)] pl-3.5 pr-3 text-[13px] text-[var(--muted)] hover:border-[var(--border2)] transition-all">
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 text-left">Search...</span>
                <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] text-[9px] font-mono opacity-60">⌘K</kbd>
              </button>

              {/* Mobile Search Toggle */}
              <button onClick={() => setShowSearch(true)}
                className="md:hidden p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-all"
                aria-label="Search">
                <Search className="w-[18px] h-[18px]" />
              </button>

              <ThemeToggle />

              {/* Cart */}
              <Link href="/cart"
                className="relative p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-all">
                <ShoppingCart className="w-[18px] h-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--accent)] text-[var(--accentFg)] text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {isAuthenticated ? (
                <Link href="/account"
                  className="flex items-center gap-2 ml-1 px-3 py-1.5 rounded-full border border-[var(--border)] hover:border-[var(--border2)] transition-all">
                  <div className="w-6 h-6 rounded-full bg-[var(--text)] flex items-center justify-center">
                    <span className="text-[var(--bg2)] text-[10px] font-bold">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm text-[var(--text)] font-medium hidden sm:block">{user?.name || 'Account'}</span>
                </Link>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="btn-primary text-xs py-2 px-4 ml-1">Sign In</button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Unified Search Modal */}
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
}
