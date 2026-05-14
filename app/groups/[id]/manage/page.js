'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Copy, Check, CheckCircle, XCircle, Users,
  Shield, Loader2, UserMinus, Archive, Link as LinkIcon,
} from 'lucide-react';
import Header from '../../../../components/layout/Header';
import MobileNav from '../../../../components/layout/MobileNav';
import Footer from '../../../../components/layout/Footer';
import AuthModal from '../../../../components/ui/AuthModal';
import { MotionPage } from '../../../../components/ui/Motion';
import { Container, SectionHeader, Divider } from '../../../../components/ui/Layout';
import { useStore } from '../../../../lib/store';
import { formatCurrency } from '../../../../lib/utils';
import api from '../../../../lib/api';

export default function ManageGroupPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, setShowAuthModal } = useStore();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await api.getGroupMembers(params.id);
    if (res.success) {
      setGroup(res.data.group);
      setMembers(res.data.members);
    } else {
      setError(res.message || 'Failed to load group');
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen"><Header /><AuthModal />
        <main className="pt-24 pb-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
            <h2 className="text-heading text-xl mb-2">Sign in to manage</h2>
            <button onClick={() => setShowAuthModal(true)} className="btn-primary text-sm">Sign In</button>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  const isOwner = group && members.some(m => m.is_you && m.role === 'OWNER');

  const handleVerify = async (userId, verified) => {
    setActionLoading(`verify-${userId}`);
    const res = await api.verifyGroupMember(params.id, userId, verified);
    if (res.success) {
      setMembers(prev => prev.map(m =>
        m.user_id === userId ? { ...m, is_verified: res.data.is_verified } : m
      ));
    }
    setActionLoading(null);
  };

  const handleRemove = async (userId, name) => {
    if (!confirm(`Remove ${name} from this group?`)) return;
    setActionLoading(`remove-${userId}`);
    const res = await api.removeGroupMember(params.id, userId);
    if (res.success) {
      setMembers(prev => prev.filter(m => m.user_id !== userId));
      setGroup(prev => prev ? { ...prev, member_count: prev.member_count - 1 } : prev);
    }
    setActionLoading(null);
  };

  const handleArchive = async () => {
    if (!confirm('Archive this group? Members will lose access.')) return;
    setActionLoading('archive');
    const res = await api.archiveGroup(params.id);
    if (res.success) router.push('/groups?tab=my');
    setActionLoading(null);
  };

  const copyInvite = () => {
    if (!group) return;
    navigator.clipboard.writeText(`${window.location.origin}/join/${group.invite_code || ''}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen"><Header /><AuthModal />
        <main className="pt-24 pb-24"><Container className="max-w-2xl">
          <div className="skeleton h-8 w-48 rounded mb-8" />
          <div className="skeleton h-32 rounded-[16px] mb-4" />
          <div className="skeleton h-16 rounded-[16px] mb-2" />
          <div className="skeleton h-16 rounded-[16px] mb-2" />
          <div className="skeleton h-16 rounded-[16px]" />
        </Container></main>
        <MobileNav />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen"><Header /><AuthModal />
        <main className="pt-24 pb-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-[var(--danger)] mx-auto mb-4" />
            <h2 className="text-heading text-xl mb-2">{error || 'Group not found'}</h2>
            <button onClick={() => router.push('/groups?tab=my')} className="btn-ghost text-sm">Back to Groups</button>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen"><Header /><AuthModal />
        <main className="pt-24 pb-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
            <h2 className="text-heading text-xl mb-2">Owner access required</h2>
            <button onClick={() => router.push('/groups?tab=my')} className="btn-ghost text-sm">Back to Groups</button>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  const seatsLeft = group.share_limit - group.member_count;

  return (
    <div className="min-h-screen"><Header /><AuthModal />
      <MotionPage>
        <section className="pt-28 pb-8 md:pt-36">
          <Container className="max-w-2xl">
            <button onClick={() => router.push('/groups?tab=my')} className="btn-ghost text-sm mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Groups
            </button>

            <SectionHeader meta="GROUP MANAGEMENT" title={group.name} align="left" className="mb-8" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="paper-card p-4 text-center">
                <p className="text-2xl font-serif text-[var(--text)]">{group.member_count}</p>
                <p className="text-[10px] text-[var(--muted)] mt-1">MEMBERS</p>
              </div>
              <div className="paper-card p-4 text-center">
                <p className="text-2xl font-serif text-[var(--text)]">{group.share_limit}</p>
                <p className="text-[10px] text-[var(--muted)] mt-1">MAX SEATS</p>
              </div>
              <div className="paper-card p-4 text-center">
                <p className={`text-2xl font-serif ${seatsLeft > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{seatsLeft}</p>
                <p className="text-[10px] text-[var(--muted)] mt-1">SEATS LEFT</p>
              </div>
            </div>

            {/* Invite Link */}
            <div className="paper-card p-4 mb-8">
              <p className="text-meta text-[10px] mb-2">INVITE LINK</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] truncate">
                  {typeof window !== 'undefined' ? `${window.location.origin}/join/${group.invite_code || ''}` : ''}
                </div>
                <button onClick={copyInvite} className="btn-primary px-3 py-2 text-xs shrink-0">
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
            </div>

            {/* Members List */}
            <div className="paper-card overflow-hidden mb-8">
              <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--muted)]" />
                  <span className="text-meta text-xs">MEMBERS ({members.length})</span>
                </div>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {members.map(member => (
                  <div key={member.user_id} className="px-5 py-4 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--text)] truncate">{member.name}</span>
                        {member.role === 'OWNER' && (
                          <span className="badge text-[9px] !bg-[var(--accent)]/10 !text-[var(--accent)] !border-[var(--accent)]/30">OWNER</span>
                        )}
                        {member.is_verified && (
                          <CheckCircle className="w-3.5 h-3.5 text-[var(--success)]" />
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--muted)] mt-0.5">{member.phone_masked}</p>
                    </div>
                    {!member.is_you && member.role !== 'OWNER' && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleVerify(member.user_id, !member.is_verified)}
                          disabled={actionLoading === `verify-${member.user_id}`}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                            member.is_verified
                              ? 'border-[var(--success)] text-[var(--success)] bg-[var(--success)]/5'
                              : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--success)] hover:text-[var(--success)]'
                          }`}
                        >
                          {actionLoading === `verify-${member.user_id}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : member.is_verified ? (
                            <><CheckCircle className="w-3.5 h-3.5 inline" /> Verified</>
                          ) : (
                            'Verify'
                          )}
                        </button>
                        <button
                          onClick={() => handleRemove(member.user_id, member.name)}
                          disabled={actionLoading === `remove-${member.user_id}`}
                          className="text-xs px-2 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:border-[var(--danger)] hover:text-[var(--danger)] transition-colors"
                        >
                          {actionLoading === `remove-${member.user_id}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserMinus className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleArchive}
                disabled={actionLoading === 'archive'}
                className="btn-ghost w-full py-3 text-sm text-[var(--danger)] border-[var(--danger)]/30 hover:bg-[var(--danger)]/5"
              >
                {actionLoading === 'archive' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Archiving...</>
                ) : (
                  <><Archive className="w-4 h-4" /> Archive Group</>
                )}
              </button>
            </div>
          </Container>
        </section>
        <Footer />
      </MotionPage>
      <MobileNav />
    </div>
  );
}
