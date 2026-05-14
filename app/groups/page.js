'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Users, Plus, Copy, Check, MessageCircle, Ticket, Settings } from 'lucide-react';
import JoinByCodeModal from '../../components/join/JoinByCodeModal';
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
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'public';
  const [tab, setTab] = useState(initialTab);
  const [publicGroups, setPublicGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Fetch both public and my groups on mount for filtering
  useEffect(() => {
    setLoading(true);
    const promises = [
      api.getPublicGroups(1).then(r => {
        if (r.success) setPublicGroups(r.data?.groups || r.data || []);
      }),
    ];
    if (isAuthenticated) {
      promises.push(
        Promise.all([api.getMyGroups(), api.getOwnedGroups()]).then(([myRes, ownRes]) => {
          const my = myRes.success ? (myRes.data || []) : [];
          const owned = ownRes.success ? (ownRes.data || []) : [];
          const map = new Map();
          owned.forEach(g => map.set(g._id, { ...g, _role: 'owner' }));
          my.forEach(g => { if (!map.has(g._id)) map.set(g._id, { ...g, _role: 'member' }); });
          setMyGroups(Array.from(map.values()));
        })
      );
    }
    Promise.all(promises).then(() => setLoading(false));
  }, [isAuthenticated]);

  // Filter public groups to exclude ones the user already joined
  const visiblePublicGroups = useMemo(() => {
    if (!isAuthenticated || myGroups.length === 0) return publicGroups;
    const myGroupIds = new Set(myGroups.map(g => g._id?.toString()));
    return publicGroups.filter(g => !myGroupIds.has(g._id?.toString()));
  }, [publicGroups, myGroups, isAuthenticated]);

  const copyInvite = (code) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const groups = tab === 'public' ? visiblePublicGroups : myGroups;

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
              <button onClick={() => setShowJoinModal(true)} className="btn-secondary text-xs py-2 px-4 flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5" /> Join by code
              </button>
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
              tab === 'public' && publicGroups.length > 0 && isAuthenticated ? (
                <div className="paper-card p-8 text-center">
                  <p className="text-caption mb-2">You've joined all available groups!</p>
                  <p className="text-xs text-[var(--muted)] mb-4">Check "My Groups" to see them</p>
                  <Link href="/create-group" className="btn-primary text-sm">Create a New Group</Link>
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title={tab === 'public' ? 'No public groups yet' : 'No groups yet'}
                  description={tab === 'public' ? 'Be the first to create one!' : 'Join a group or create your own'}
                  actionLabel="Create Group"
                  actionHref="/create-group"
                >
                  {tab === 'my' && (
                    <button onClick={() => setShowJoinModal(true)} className="btn-secondary text-xs py-2 px-4 mt-3 inline-flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5" /> Join by code
                    </button>
                  )}
                </EmptyState>
              )
            ) : tab === 'public' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map(group => {
                  const filled = group.member_count || 0;
                  const total = group.share_limit || 5;
                  const pct = Math.min((filled / total) * 100, 100);
                  const seatsLeft = total - filled;
                  const isFull = filled >= total;
                  return (
                    <div key={group._id} className="paper-card p-5">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-heading text-sm truncate">{group.name}</h3>
                      </div>
                      <p className="text-meta text-[10px] mb-3">{group.brand_id?.name || 'Service'}</p>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-caption">{isFull ? 'Full' : `${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} left`}</span>
                        <span className="font-medium text-[var(--text)]">{formatCurrency(group.share_price || 0)}/mo</span>
                      </div>
                      <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      {isFull ? (
                        <span className="w-full text-center text-xs text-[var(--muted)] py-2 border border-[var(--border)] rounded-xl block">
                          Group Full
                        </span>
                      ) : (
                        <Link href={group.invite_code ? `/join/${group.invite_code}` : '#'} className="btn-primary text-xs py-2 w-full text-center block">
                          Join Group
                        </Link>
                      )}
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
                          {group.status === 'expired' && <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-red-400 bg-red-400/10">EXPIRED</span>}
                          {group.status === 'archived' && <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-[var(--muted)] bg-gray-400/10">ARCHIVED</span>}
                        </div>
                        <p className="text-meta text-[10px] mt-1">{group.brand_id?.name || 'Service'} · {group.member_count || 0} members</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {group._role === 'owner' && (
                          <Link href={`/groups/${group._id}/manage`} className="btn-secondary text-xs py-1.5 px-3">
                            <Settings className="w-3.5 h-3.5" /> Manage
                          </Link>
                        )}
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
      <JoinByCodeModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
    </div>
  );
}
