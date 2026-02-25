'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Users, ShoppingBag, UsersRound, Ticket, Tag,
    Settings, LogOut, ChevronLeft, ChevronRight, Shield, ArrowDownRight
} from 'lucide-react';
import { useStore } from '../../lib/store';
import api from '../../lib/api';
const BRAND = require('../../lib/brand');

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: UsersRound, label: 'Groups', path: '/admin/groups' },
    { icon: ArrowDownRight, label: 'Withdrawals', path: '/admin/withdrawals' },
    { icon: Ticket, label: 'Coupons', path: '/admin/coupons' },
    { icon: Tag, label: 'Brands', path: '/admin/brands' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout, setShowAuthModal } = useStore();
    const [collapsed, setCollapsed] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setChecking(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleLogout = async () => {
        await api.logout();
        api.clearTokens();
        logout();
        router.push('/');
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[var(--muted)] text-sm">Loading admin...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
                    <h2 className="font-heading font-bold text-xl text-[var(--text)] mb-2">Admin Access Required</h2>
                    <p className="text-[var(--muted)] text-sm mb-5">Please sign in with an admin account</p>
                    <button onClick={() => { setShowAuthModal(true); }} className="btn-primary py-3 px-8 text-sm">
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-red-500/50 mx-auto mb-4" />
                    <h2 className="font-heading font-bold text-xl text-[var(--text)] mb-2">403 — Not Authorized</h2>
                    <p className="text-[var(--muted)] text-sm mb-5">You don't have admin permissions</p>
                    <Link href="/" className="btn-primary py-3 px-8 text-sm">Go to Homepage</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar — intentionally dark panel */}
            <aside className={`fixed top-0 left-0 h-full z-40 bg-[#0d0d14] border-r border-white/[0.06] transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-56'}`}>
                <div className="h-14 flex items-center px-4 border-b border-white/[0.06] gap-2">
                    <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center shrink-0">
                        <span className="text-white font-heading font-bold text-sm">{BRAND.name.charAt(0)}</span>
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <span className="font-heading font-bold text-white text-sm">{BRAND.name}</span>
                            <span className="block text-[10px] text-brand-primary-light font-semibold uppercase tracking-wider">Admin</span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
                    {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
                        const isActive = path === '/admin' ? pathname === '/admin' : pathname.startsWith(path);
                        return (
                            <Link
                                key={path}
                                href={path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-brand-primary/10 text-brand-primary-light border border-brand-primary/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                title={collapsed ? label : undefined}
                            >
                                <Icon className="w-4.5 h-4.5 shrink-0" />
                                {!collapsed && <span>{label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-2 border-t border-white/[0.06] space-y-1">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 text-sm transition-all"
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4 shrink-0" /> : <><ChevronLeft className="w-4 h-4 shrink-0" /><span>Collapse</span></>}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/5 text-sm transition-all"
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-56'}`}>
                <header className="sticky top-0 z-30 h-14 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)] flex items-center justify-between px-6">
                    <div />
                    <div className="flex items-center gap-3">
                        <span className="text-[var(--muted)] text-sm">{user?.name || 'Admin'}</span>
                        <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center">
                            <span className="text-white font-bold text-xs">{(user?.name || 'A').charAt(0).toUpperCase()}</span>
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
