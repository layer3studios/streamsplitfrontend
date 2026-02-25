'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, MessageCircle, Check, X, Clock, Loader2, Users } from 'lucide-react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import AuthModal from '../../components/ui/AuthModal';
import AuthGate from '../../components/ui/AuthGate';
import { MotionPage } from '../../components/ui/Motion';
import { Container, SectionHeader, Divider } from '../../components/ui/Layout';
import EmptyState from '../../components/ui/EmptyState';
import { ListSkeleton } from '../../components/ui/Skeleton';
import UserAvatar from '../../components/ui/UserAvatar';
import { useStore } from '../../lib/store';
import api from '../../lib/api';

export default function FriendsPage() {
    const router = useRouter();
    const { isAuthenticated } = useStore();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});

    const loadData = useCallback(async () => {
        if (!isAuthenticated) { setLoading(false); return; }
        setLoading(true);
        const [fRes, rRes] = await Promise.all([api.getFriends(), api.getFriendRequests()]);
        if (fRes.success) setFriends(fRes.data || []);
        if (rRes.success) setRequests(rRes.data || { incoming: [], outgoing: [] });
        setLoading(false);
    }, [isAuthenticated]);

    useEffect(() => { loadData(); }, [loadData]);

    // Search debounce
    useEffect(() => {
        if (query.trim().length < 2) { setResults([]); return; }
        const timer = setTimeout(async () => {
            setSearching(true);
            const res = await api.searchUsers(query.trim());
            if (res.success) setResults(res.data || []);
            setSearching(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSendRequest = async (uid) => {
        setActionLoading(s => ({ ...s, [uid]: true }));
        const res = await api.sendFriendRequest(uid);
        if (res.success) {
            if (res.data?.auto_accepted) {
                await loadData();
            } else {
                await loadData();
            }
        }
        setActionLoading(s => ({ ...s, [uid]: false }));
    };

    const handleAccept = async (requestId) => {
        setActionLoading(s => ({ ...s, [requestId]: true }));
        await api.acceptFriendRequest(requestId);
        await loadData();
        setActionLoading(s => ({ ...s, [requestId]: false }));
    };

    const handleReject = async (requestId) => {
        setActionLoading(s => ({ ...s, [requestId]: true }));
        await api.rejectFriendRequest(requestId);
        await loadData();
        setActionLoading(s => ({ ...s, [requestId]: false }));
    };

    const handleCancel = async (requestId) => {
        setActionLoading(s => ({ ...s, [requestId]: true }));
        await api.cancelFriendRequest(requestId);
        await loadData();
        setActionLoading(s => ({ ...s, [requestId]: false }));
    };

    const handleMessage = async (uid) => {
        setActionLoading(s => ({ ...s, [uid]: true }));
        const res = await api.startDM(uid);
        if (res.success) router.push(`/chat?room=${res.data.room_id}`);
        setActionLoading(s => ({ ...s, [uid]: false }));
    };

    // Build a set of friend IDs + pending request IDs for search results
    const friendIds = new Set(friends.map(f => f._id));
    const outgoingIds = new Set(requests.outgoing.map(r => r.user._id));

    return (
        <div className="min-h-screen"><Header /><AuthModal />
            <MotionPage>
                <AuthGate>
                    <section className="pt-28 pb-[var(--section-gap)] md:pt-36">
                        <Container className="max-w-xl mx-auto">
                            <SectionHeader meta="FRIENDS" title="Friends" subtitle="Find people and start chatting." />

                            {/* Search */}
                            <div className="mt-8 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="Search by name or phone..."
                                    className="input pl-11"
                                />
                            </div>

                            {/* Search Results */}
                            {query.trim().length >= 2 && (
                                <div className="mt-3 paper-card divide-y divide-[var(--border)]">
                                    {searching ? (
                                        <div className="p-4"><ListSkeleton rows={2} /></div>
                                    ) : results.length === 0 ? (
                                        <p className="p-4 text-caption text-center">No users found</p>
                                    ) : (
                                        results.map(u => (
                                            <div key={u._id} className="flex items-center gap-3 p-3">
                                                <UserAvatar name={u.name} userId={u._id} size={36} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-[var(--text)] truncate">{u.name}</p>
                                                    <p className="text-[10px] text-[var(--muted)]">{u.phone_masked}</p>
                                                </div>
                                                {friendIds.has(u._id) ? (
                                                    <button onClick={() => handleMessage(u._id)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                                                        <MessageCircle className="w-3 h-3" /> Message
                                                    </button>
                                                ) : outgoingIds.has(u._id) ? (
                                                    <span className="text-[10px] text-[var(--muted)] flex items-center gap-1"><Clock className="w-3 h-3" /> Requested</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSendRequest(u._id)}
                                                        disabled={actionLoading[u._id]}
                                                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                                                    >
                                                        {actionLoading[u._id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <><UserPlus className="w-3 h-3" /> Add</>}
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {loading ? (
                                <div className="mt-8"><ListSkeleton rows={4} /></div>
                            ) : (
                                <>
                                    {/* Incoming Requests */}
                                    {requests.incoming.length > 0 && (
                                        <div className="mt-8">
                                            <p className="text-meta mb-3">INCOMING REQUESTS · {requests.incoming.length}</p>
                                            <div className="paper-card divide-y divide-[var(--border)]">
                                                {requests.incoming.map(r => (
                                                    <div key={r._id} className="flex items-center gap-3 p-3">
                                                        <UserAvatar name={r.user.name} userId={r.user._id} size={36} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-[var(--text)] truncate">{r.user.name}</p>
                                                            <p className="text-[10px] text-[var(--muted)]">{r.user.phone_masked}</p>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleAccept(r._id)}
                                                                disabled={actionLoading[r._id]}
                                                                className="p-2 rounded-xl bg-[var(--text)] text-[var(--bg2)] hover:opacity-80 transition-opacity"
                                                                title="Accept"
                                                            >
                                                                {actionLoading[r._id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(r._id)}
                                                                disabled={actionLoading[r._id]}
                                                                className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
                                                                title="Reject"
                                                            >
                                                                <X className="w-3.5 h-3.5 text-[var(--muted)]" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Outgoing Requests */}
                                    {requests.outgoing.length > 0 && (
                                        <div className="mt-6">
                                            <p className="text-meta mb-3">SENT REQUESTS · {requests.outgoing.length}</p>
                                            <div className="paper-card divide-y divide-[var(--border)]">
                                                {requests.outgoing.map(r => (
                                                    <div key={r._id} className="flex items-center gap-3 p-3">
                                                        <UserAvatar name={r.user.name} userId={r.user._id} size={36} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-[var(--text)] truncate">{r.user.name}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCancel(r._id)}
                                                            disabled={actionLoading[r._id]}
                                                            className="btn-ghost text-xs flex items-center gap-1 text-[var(--danger)]"
                                                        >
                                                            {actionLoading[r._id] ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cancel'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Friends List */}
                                    <Divider className="my-8" />
                                    <p className="text-meta mb-3">MY FRIENDS · {friends.length}</p>
                                    {friends.length === 0 ? (
                                        <EmptyState icon={Users} title="No friends yet" description="Search for someone above to get started" />
                                    ) : (
                                        <div className="paper-card divide-y divide-[var(--border)]">
                                            {friends.map(f => (
                                                <div key={f._id} className="flex items-center gap-3 p-3">
                                                    <UserAvatar name={f.name} userId={f._id} size={36} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-[var(--text)] truncate">{f.name}</p>
                                                        <p className="text-[10px] text-[var(--muted)]">{f.phone_masked}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleMessage(f._id)}
                                                        disabled={actionLoading[f._id]}
                                                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                                                    >
                                                        {actionLoading[f._id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <><MessageCircle className="w-3 h-3" /> Message</>}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </Container>
                    </section>
                </AuthGate>
            </MotionPage>
            <MobileNav />
        </div>
    );
}
