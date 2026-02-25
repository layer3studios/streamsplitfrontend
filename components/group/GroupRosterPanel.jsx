'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, MessageCircle, UserPlus, Clock, Loader2 } from 'lucide-react';
import UserAvatar from '../ui/UserAvatar';
import GroupSeatPills from './GroupSeatPills';
import { SectionHeader, Divider } from '../ui/Layout';
import api from '../../lib/api';
import { useStore } from '../../lib/store';

/**
 * GroupRosterPanel — Full-screen panel showing seat cards + member index.
 * Opens from chat header or group page.
 */
export default function GroupRosterPanel({ groupId, onClose }) {
    const router = useRouter();
    const { user } = useStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [friendStates, setFriendStates] = useState({});
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        if (!groupId) return;
        (async () => {
            setLoading(true);
            const res = await api.getGroupMembers(groupId);
            if (res.success) {
                setData(res.data);
                // Load friend states
                const friendsRes = await api.getFriends();
                const requestsRes = await api.getFriendRequests();
                const states = {};
                if (friendsRes.success) {
                    friendsRes.data.forEach(f => { states[f._id] = 'friend'; });
                }
                if (requestsRes.success) {
                    requestsRes.data.outgoing?.forEach(r => { states[r.user._id] = 'requested'; });
                    requestsRes.data.incoming?.forEach(r => { states[r.user._id] = 'incoming'; });
                }
                setFriendStates(states);
            }
            setLoading(false);
        })();
    }, [groupId]);

    const handleAddFriend = async (uid) => {
        setActionLoading(s => ({ ...s, [uid]: true }));
        const res = await api.sendFriendRequest(uid);
        if (res.success) {
            setFriendStates(s => ({ ...s, [uid]: res.data?.auto_accepted ? 'friend' : 'requested' }));
        }
        setActionLoading(s => ({ ...s, [uid]: false }));
    };

    const handleMessage = async (uid) => {
        setActionLoading(s => ({ ...s, [uid]: true }));
        const res = await api.startDM(uid);
        if (res.success) {
            router.push(`/chat?room=${res.data.room_id}`);
            onClose?.();
        }
        setActionLoading(s => ({ ...s, [uid]: false }));
    };

    if (!groupId) return null;

    const group = data?.group;
    const members = data?.members || [];
    const shareLimit = group?.share_limit || 4;
    const memberCount = group?.member_count || members.length;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-24">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[var(--text)]/30 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative bg-[var(--bg)] border border-[var(--border)] rounded-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-[var(--bg)] border-b border-[var(--border)] p-4 flex items-center justify-between z-10 rounded-t-2xl">
                    <div>
                        <p className="text-meta">ROSTER</p>
                        <h3 className="font-serif text-xl">Seats<span className="text-[var(--accent)]">•</span></h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--surface)] transition-colors">
                        <X className="w-5 h-5 text-[var(--muted)]" />
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
                    </div>
                ) : (
                    <div className="p-4">
                        {/* Summary */}
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-caption">{memberCount} of {shareLimit} filled</p>
                            <GroupSeatPills memberCount={memberCount} shareLimit={shareLimit} />
                        </div>

                        {/* Seat cards grid */}
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            {Array.from({ length: shareLimit }).map((_, i) => {
                                const member = members[i];
                                const isOwner = member?.role === 'OWNER';
                                return (
                                    <div
                                        key={i}
                                        className={`paper-card p-3 relative ${!member ? 'opacity-50' : ''}`}
                                    >
                                        {isOwner && (
                                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--accent)]" title="Owner" />
                                        )}
                                        <p className="text-[9px] text-[var(--muted)] font-mono mb-2">SEAT {i + 1}</p>
                                        {member ? (
                                            <div className="flex items-center gap-2">
                                                <UserAvatar name={member.name} userId={member.user_id} size={28} />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-[var(--text)] truncate">
                                                        {member.name}{member.is_you ? ' (you)' : ''}
                                                    </p>
                                                    <p className="text-[9px] text-[var(--muted)]">{member.role}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-[var(--muted)] italic">Empty seat</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <Divider className="mb-4" />

                        {/* Member Index */}
                        <p className="text-meta mb-3">MEMBER INDEX</p>
                        <div className="space-y-2">
                            {members.map(m => {
                                const isYou = m.is_you;
                                const fs = friendStates[m.user_id];
                                const isLoading = actionLoading[m.user_id];

                                return (
                                    <div key={m.user_id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--surface)] transition-colors">
                                        <UserAvatar name={m.name} userId={m.user_id} size={32} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-[var(--text)] truncate">
                                                {m.name}{isYou ? ' (you)' : ''}
                                            </p>
                                            <p className="text-[10px] text-[var(--muted)]">
                                                {m.role} · Joined {new Date(m.joined_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {!isYou && (
                                            <div className="flex items-center gap-1">
                                                {fs === 'friend' ? (
                                                    <button
                                                        onClick={() => handleMessage(m.user_id)}
                                                        disabled={isLoading}
                                                        className="p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border2)] transition-colors"
                                                        title="Message"
                                                    >
                                                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--muted)]" /> : <MessageCircle className="w-3.5 h-3.5 text-[var(--text)]" />}
                                                    </button>
                                                ) : fs === 'requested' ? (
                                                    <span className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Requested
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddFriend(m.user_id)}
                                                        disabled={isLoading}
                                                        className="p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border2)] transition-colors"
                                                        title="Add friend"
                                                    >
                                                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--muted)]" /> : <UserPlus className="w-3.5 h-3.5 text-[var(--text)]" />}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
