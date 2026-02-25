'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Compass, Users, Wallet, MessageCircle, User } from 'lucide-react';

const tabs = [
  { label: 'Explore', icon: Compass, path: '/explore' },
  { label: 'Groups', icon: Users, path: '/groups' },
  { label: 'Wallet', icon: Wallet, path: '/wallet' },
  { label: 'Chat', icon: MessageCircle, path: '/chat' },
  { label: 'Account', icon: User, path: '/account' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-sm border-t border-[var(--border)] md:hidden mobile-nav-safe">
      <div className="flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.path ||
            (tab.path !== '/' && pathname.startsWith(tab.path));

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${isActive
                  ? 'text-[var(--text)]'
                  : 'text-[var(--muted)]'
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-[var(--accent)] -mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
