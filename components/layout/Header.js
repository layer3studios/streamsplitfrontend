'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ShoppingCart, X, Command } from 'lucide-react';
import { useStore } from '../../lib/store';
import ThemeToggle from '../ui/ThemeToggle';
const BRAND = require('../../lib/brand');

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, user, setShowAuthModal, cartCount } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearch, setMobileSearch] = useState(false);
  const mobileInputRef = useRef(null);
  const desktopInputRef = useRef(null);

  const navLinks = [
    { label: 'Explore', href: '/explore' },
    { label: 'Groups', href: '/groups' },
    { label: 'Wallet', href: '/wallet' },
    { label: 'Chat', href: '/chat' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/explore?query=${encodeURIComponent(searchQuery.trim())}`);
    setMobileSearch(false);
    setSearchQuery('');
  };

  // Close mobile search on Escape
  useEffect(() => {
    if (!mobileSearch) return;
    const handler = (e) => { if (e.key === 'Escape') setMobileSearch(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [mobileSearch]);

  // Focus when modal opens
  useEffect(() => {
    if (mobileSearch) mobileInputRef.current?.focus();
  }, [mobileSearch]);

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

              {/* Desktop Search — thin, elegant, pill-shaped */}
              <form onSubmit={handleSearch} className="hidden md:block relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
                <input
                  ref={desktopInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-[38px] w-44 lg:w-56 xl:max-w-[380px] rounded-full bg-transparent border border-[var(--border)] pl-9 pr-4 text-[13px] text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition-all focus:border-[var(--border2)] focus:ring-2 focus:ring-[var(--accent)]/15"
                />
              </form>

              {/* Mobile Search Toggle */}
              <button
                onClick={() => setMobileSearch(true)}
                className="md:hidden p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-all"
                aria-label="Search"
              >
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

      {/* ═══ Mobile Search Modal (Command Palette) ═══ */}
      {mobileSearch && (
        <div className="fixed inset-0 z-[110] md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setMobileSearch(false)} />
          <div className="relative mx-4 mt-4 animate-slide-up">
            <form onSubmit={handleSearch} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden"
              style={{ boxShadow: 'var(--shadowSoft)' }}>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
                <Search className="w-5 h-5 text-[var(--muted)] shrink-0" />
                <input
                  ref={mobileInputRef}
                  type="text"
                  placeholder="Search brands, plans, groups..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-[var(--text)] text-base outline-none placeholder:text-[var(--muted)]"
                />
                <button type="button" onClick={() => setMobileSearch(false)}
                  className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-4 py-3 flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Press Enter to search</span>
                <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] text-[10px] font-mono">ESC</kbd>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
