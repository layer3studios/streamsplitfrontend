'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Plus, Copy, Check, MessageCircle } from 'lucide-react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Footer from '../../components/layout/Footer';
import AuthModal from '../../components/ui/AuthModal';
import { MotionPage } from '../../components/ui/Motion';
import { Container, SectionHeader, Divider } from '../../components/ui/Layout';
import EmptyState from '../../components/ui/EmptyState';
import { GridSkeleton } from '../../components/ui/Skeleton';
import { useStore } from '../../lib/store';
import { formatCurrency } from '../../lib/utils';
import api from '../../lib/api';

export default function GroupsPage() {
  const { isAuthenticated, setShowAuthModal } = useStore();
  const [tab, setTab] = useState('public');
  const [publicGroups, setPublicGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    setLoading(true);
    if (tab === 'public') {
      api.getPublicGroups(1).then(r => {
        if (r.success) setPublicGroups(r.data?.groups || r.data || []);
        setLoading(false);
      });
    } else {
      if (!isAuthenticated) { setLoading(false); return; }
      Promise.all([api.getMyGroups(), api.getOwnedGroups()]).then(([myRes, ownRes]) => {
        const my = myRes.success ? (myRes.data || []) : [];
        const owned = ownRes.success ? (ownRes.data || []) : [];
        setMyGroups([...owned.map(g => ({ ...g, _role: 'owner' })), ...my.map(g => ({ ...g, _role: 'member' }))]);
        setLoading(false);
      });
    }
  }, [tab, isAuthenticated]);

  const copyInvite = (code) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const groups = tab === 'public' ? publicGroups : myGroups;

  return (
    <div className="min-h-screen"><Header /><AuthModal />
      <MotionPage>
        <section className="pt-28 pb-8 md:pt-36">
          <Container>
            <SectionHeader meta="SHARED SAVINGS" title="Groups" subtitle="Join or create subscription sharing groups" />
          </Container>
        </section>

        <Container><Divider /></Container>

        <section className="py-8">
          <Container>
            {/* Tabs */}
            <div className="flex items-center gap-6 mb-8">
              <button onClick={() => setTab('public')} className={`text-sm font-medium pb-2 border-b-2 transition-colors ${tab === 'public' ? 'border-[var(--accent)] text-[var(--text)]' : 'border-transparent text-[var(--muted)]'}`}>
                Public Groups
              </button>
              <button onClick={() => setTab('my')} className={`text-sm font-medium pb-2 border-b-2 transition-colors ${tab === 'my' ? 'border-[var(--accent)] text-[var(--text)]' : 'border-transparent text-[var(--muted)]'}`}>
                My Groups
              </button>
              <div className="flex-1" />
              <Link href="/create-group" className="btn-primary text-xs py-2 px-4">
                <Plus className="w-4 h-4" /> Create
              </Link>
            </div>

            {/* Content */}
            {loading ? (
              <GridSkeleton count={6} />
            ) : tab === 'my' && !isAuthenticated ? (
              <div className="paper-card p-12 text-center">
                <p className="text-caption mb-4">Sign in to see your groups</p>
                <button onClick={() => setShowAuthModal(true)} className="btn-primary text-sm">Sign In</button>
              </div>
            ) : groups.length === 0 ? (
              <EmptyState
                icon={Users}
                title={tab === 'public' ? 'No public groups yet' : 'No groups yet'}
                description={tab === 'public' ? 'Be the first to create one!' : 'Join a group or create your own'}
                actionLabel="Create Group"
                actionHref="/create-group"
              />
            ) : tab === 'public' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map(group => {
                  const filled = group.member_count || 0;
                  const total = group.max_members || 4;
                  const pct = Math.min((filled / total) * 100, 100);
                  return (
                    <div key={group._id} className="paper-card p-5">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-heading text-sm truncate">{group.name}</h3>
                      </div>
                      <p className="text-meta text-[10px] mb-3">{group.brand_id?.name || 'Service'}</p>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-caption">{filled}/{total} seats</span>
                        <span className="font-medium text-[var(--text)]">{formatCurrency(group.share_price || group.price_per_member || 0)}/mo</span>
                      </div>
                      <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <Link href={group.invite_code ? `/join/${group.invite_code}` : '#'} className="btn-primary text-xs py-2 w-full text-center">
                        Join Group
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* My Groups — editorial list */
              <div className="space-y-0">
                {groups.map((group, i) => (
                  <div key={group._id}>
                    <div className="flex items-center justify-between py-5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-heading text-sm truncate">{group.name}</h3>
                          <span className="badge text-[9px]">{group._role === 'owner' ? 'OWNER' : 'MEMBER'}</span>
                        </div>
                        <p className="text-meta text-[10px] mt-1">{group.brand_id?.name || 'Service'} · {group.member_count || 0} members</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {group.invite_code && (
                          <button onClick={() => copyInvite(group.invite_code)} className="btn-secondary text-xs py-1.5 px-3">
                            {copiedCode === group.invite_code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedCode === group.invite_code ? 'Copied' : 'Invite'}
                          </button>
                        )}
                        <Link href="/chat" className="btn-ghost p-2">
                          <MessageCircle className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                    {i < groups.length - 1 && <Divider />}
                  </div>
                ))}
              </div>
            )}
          </Container>
        </section>

        <Footer />
      </MotionPage>

      {/* Mobile FAB */}
      <Link href="/create-group" className="md:hidden fixed bottom-20 right-4 z-30 w-12 h-12 bg-[var(--text)] text-[var(--bg2)] rounded-full flex items-center justify-center shadow-lg">
        <Plus className="w-5 h-5" />
      </Link>
      <MobileNav />
    </div>
  );
}
