'use client';
import { useState, useEffect, useCallback } from 'react';
import { X, Copy, Check, RefreshCw, Link2, Plus, LogOut, Loader2, Shield, BookOpen, Key, Users2, Share2 } from 'lucide-react';
import GroupSeatPills from './GroupSeatPills';
import UserAvatar from '../ui/UserAvatar';
import { Divider } from '../ui/Layout';
import api from '../../lib/api';
import { useStore } from '../../lib/store';

const BASE = typeof window !== 'undefined' ? window.location.origin : '';

export default function GroupInfoDrawer({ groupId, groupName, onClose }) {
    const { user } = useStore();
    const [tab, setTab] = useState('seats');
    const [members, setMembers] = useState({ group: null, members: [] });
    const [rules, setRules] = useState({ rules: '', onboarding_steps: [] });
    const [vault, setVault] = useState(null);
    const [invite, setInvite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    // Owner form states
    const [editRules, setEditRules] = useState(null);
    const [vaultForm, setVaultForm] = useState({ email: '', password: '', notes: '' });
    const [annText, setAnnText] = useState('');
    const [annPinned, setAnnPinned] = useState(false);

    const [isMember, setIsMember] = useState(false);

    const loadData = useCallback(async () => {
        if (!groupId) return;
        setLoading(true);

        // Step 1: Check membership via members endpoint
        const mRes = await api.getGroupMembers(groupId);
        if (mRes.success) {
            setMembers(mRes.data);
            const me = mRes.data.members?.find(m => m.is_you);
            setIsOwner(me?.role === 'OWNER');
            setIsMember(true);

            // Step 2: Only load rules/vault if confirmed member
            const [rRes, vRes] = await Promise.all([
                api.getGroupRules(groupId),
                api.getVaultLatest(groupId),
            ]);
            if (rRes.success) {
                setRules(rRes.data);
            }
            if (vRes.success) setVault(vRes.data);
        } else {
            setIsMember(false);
        }
        setLoading(false);
    }, [groupId]);

    useEffect(() => { loadData(); }, [loadData]);

    const copyText = async (text, label, messageId, event) => {
        await navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
        if (messageId && event) api.logVaultAccess(messageId, event);
    };

    const handleCreateInvite = async () => {
        setActionLoading(true);
        const res = await api.createGroupInvite(groupId);
        if (res.success) setInvite(res.data);
        setActionLoading(false);
    };

    const handleSaveRules = async () => {
        if (!editRules) return;
        const bullets = editRules.bullets.map(b => b.trim()).filter(Boolean);
        if (bullets.length === 0) return;
        setActionLoading(true);
        const res = await api.updateGroupRules(groupId, { rules: { title: editRules.title.trim(), bullets } });
        if (res.success) {
            setRules(res.data);
            setEditRules(null);
        }
        setActionLoading(false);
    };

    const handlePostVault = async () => {
        setActionLoading(true);
        const res = await api.postVault(groupId, vaultForm);
        if (res.success) {
            const vRes = await api.getVaultLatest(groupId);
            if (vRes.success) setVault(vRes.data);
            setVaultForm({ email: '', password: '', notes: '' });
        }
        setActionLoading(false);
    };

    const handlePostAnnouncement = async () => {
        if (!annText.trim()) return;
        setActionLoading(true);
        await api.postAnnouncement(groupId, annText.trim(), annPinned);
        setAnnText('');
        setAnnPinned(false);
        setActionLoading(false);
    };

    const handleLoggedOut = async () => {
        setActionLoading(true);
        await api.reportLoggedOut(groupId);
        setActionLoading(false);
    };

    const tabs = [
        { key: 'seats', label: 'SEATS', icon: Users2 },
        { key: 'rules', label: 'RULES', icon: BookOpen },
        { key: 'vault', label: 'VAULT', icon: Key },
        { key: 'invite', label: 'INVITE', icon: Share2 },
    ];

    const group = members.group;
    if (!groupId) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-[var(--text)]/20 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[var(--bg)] border-l border-[var(--border)] w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-[var(--bg)] border-b border-[var(--border)] p-4 flex items-center justify-between z-10">
                    <div>
                        <p className="text-meta">GROUP INFO</p>
                        <h3 className="font-serif text-lg">{groupName}<span className="text-[var(--accent)]">•</span></h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--surface)] transition-colors">
                        <X className="w-5 h-5 text-[var(--muted)]" />
                    </button>
                </div>

                {/* Tab strip */}
                <div className="flex border-b border-[var(--border)] overflow-x-auto">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex-1 min-w-0 py-2 text-[10px] font-medium tracking-wider text-center transition-colors ${tab === t.key ? 'text-[var(--text)] border-b-2 border-[var(--text)]' : 'text-[var(--muted)]'
                                }`}>
                            <t.icon className="w-3 h-3 mx-auto mb-0.5" />{t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 overflow-y-auto">
                    {loading ? (
                        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
                    ) : (
                        <>
                            {/* ─── SEATS ──────────────────────────── */}
                            {tab === 'seats' && group && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-caption">{group.member_count} of {group.share_limit} seats filled</p>
                                        <GroupSeatPills memberCount={group.member_count} shareLimit={group.share_limit} />
                                    </div>
                                    <div className="space-y-2">
                                        {members.members.map(m => (
                                            <div key={m.user_id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--surface)] transition-colors">
                                                <UserAvatar name={m.name} userId={m.user_id} size={32} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-[var(--text)] truncate">{m.name}{m.is_you ? ' (you)' : ''}</p>
                                                    <p className="text-[10px] text-[var(--muted)]">{m.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Logged out button */}
                                    <Divider className="my-4" />
                                    <button onClick={handleLoggedOut} disabled={actionLoading}
                                        className="w-full btn-ghost text-xs flex items-center justify-center gap-2 text-[var(--danger)] border border-[var(--border)] py-2.5 rounded-xl">
                                        {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                                        I got logged out
                                    </button>
                                    <p className="text-[9px] text-[var(--muted)] text-center mt-1">Sends a help request to the group chat</p>
                                </div>
                            )}

                            {/* ─── RULES ──────────────────────────── */}
                            {tab === 'rules' && (() => {
                                // Parse rules — could be JSON string or plain text
                                let parsed = { title: '', bullets: [] };
                                const raw = rules.rules;
                                if (raw) {
                                    try { parsed = JSON.parse(raw); } catch {
                                        // Legacy plain text — split by newlines into bullets
                                        parsed = { title: '', bullets: raw.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean) };
                                    }
                                }
                                const hasRules = parsed.bullets.length > 0;

                                return (
                                    <div>
                                        {/* ── Read-only view ── */}
                                        {editRules === null && (
                                            <>
                                                {hasRules ? (
                                                    <div className="paper-card p-4">
                                                        {parsed.title && <p className="text-meta mb-3">{parsed.title.toUpperCase()}</p>}
                                                        {!parsed.title && <p className="text-meta mb-3">RULES</p>}
                                                        <div className="space-y-0">
                                                            {parsed.bullets.map((b, i) => (
                                                                <div key={i} className="flex gap-2.5 py-2 border-b border-[var(--border)] last:border-b-0">
                                                                    <span className="text-[10px] text-[var(--muted)] mt-0.5 w-4 text-right shrink-0">{i + 1}.</span>
                                                                    <p className="text-sm text-[var(--text)] leading-relaxed">{b}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-10">
                                                        <BookOpen className="w-8 h-8 text-[var(--muted)] mx-auto mb-3 opacity-40" />
                                                        <p className="text-caption text-sm">No rules set yet</p>
                                                        {isOwner && <p className="text-[10px] text-[var(--muted)] mt-1">Add rules so members know the guidelines</p>}
                                                    </div>
                                                )}

                                                {isOwner && (
                                                    <button onClick={() => setEditRules({ title: parsed.title || '', bullets: hasRules ? [...parsed.bullets] : [''] })}
                                                        className="btn-primary text-xs w-full mt-4">
                                                        {hasRules ? '✏️ Edit rules' : '+ Add rules'}
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {/* ── Edit mode (owner) ── */}
                                        {editRules !== null && (
                                            <div className="space-y-3">
                                                <p className="text-meta">EDIT RULES</p>

                                                <input
                                                    type="text"
                                                    value={editRules.title}
                                                    onChange={e => setEditRules(prev => ({ ...prev, title: e.target.value.slice(0, 60) }))}
                                                    placeholder="Rules title (optional)"
                                                    className="input w-full text-sm"
                                                    maxLength={60}
                                                />

                                                <div className="space-y-0">
                                                    {editRules.bullets.map((bullet, i) => (
                                                        <div key={i} className="flex items-center gap-2 border-b border-[var(--border)] py-1">
                                                            <span className="text-[10px] text-[var(--muted)] w-4 text-right shrink-0">{i + 1}.</span>
                                                            <input
                                                                type="text"
                                                                value={bullet}
                                                                onChange={e => {
                                                                    const next = [...editRules.bullets];
                                                                    next[i] = e.target.value.slice(0, 140);
                                                                    setEditRules(prev => ({ ...prev, bullets: next }));
                                                                }}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter' && editRules.bullets.length < 12) {
                                                                        e.preventDefault();
                                                                        const next = [...editRules.bullets];
                                                                        next.splice(i + 1, 0, '');
                                                                        setEditRules(prev => ({ ...prev, bullets: next }));
                                                                        setTimeout(() => {
                                                                            const inputs = e.target.closest('.space-y-0')?.querySelectorAll('input');
                                                                            inputs?.[i + 1]?.focus();
                                                                        }, 50);
                                                                    }
                                                                }}
                                                                placeholder={`Rule ${i + 1}`}
                                                                className="flex-1 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] py-1.5"
                                                                maxLength={140}
                                                            />
                                                            {editRules.bullets.length > 1 && (
                                                                <button onClick={() => {
                                                                    const next = editRules.bullets.filter((_, j) => j !== i);
                                                                    setEditRules(prev => ({ ...prev, bullets: next }));
                                                                }} className="p-1 rounded hover:bg-[var(--surface)] transition-colors">
                                                                    <X className="w-3 h-3 text-[var(--muted)]" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {editRules.bullets.length < 12 && (
                                                    <button onClick={() => setEditRules(prev => ({ ...prev, bullets: [...prev.bullets, ''] }))}
                                                        className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
                                                        <Plus className="w-3 h-3" /> Add rule
                                                    </button>
                                                )}

                                                <p className="text-[9px] text-[var(--muted)]">{editRules.bullets.length}/12 rules · Press Enter to add next</p>

                                                <div className="flex gap-2 pt-2">
                                                    <button onClick={() => setEditRules(null)} className="btn-secondary text-xs flex-1">
                                                        Cancel
                                                    </button>
                                                    <button onClick={handleSaveRules} disabled={actionLoading}
                                                        className="btn-primary text-xs flex-1">
                                                        {actionLoading ? 'Saving…' : 'Save rules'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Announcement form (owner, below rules) */}
                                        {isOwner && editRules === null && (
                                            <>
                                                <Divider className="my-4" />
                                                <div className="space-y-3">
                                                    <p className="text-meta">POST ANNOUNCEMENT</p>
                                                    <textarea value={annText} onChange={e => setAnnText(e.target.value)} placeholder="Announcement text..." rows={2} className="input w-full text-sm" />
                                                    <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
                                                        <input type="checkbox" checked={annPinned} onChange={e => setAnnPinned(e.target.checked)} className="accent-[var(--accent)]" />
                                                        Pin this announcement
                                                    </label>
                                                    <button onClick={handlePostAnnouncement} disabled={actionLoading || !annText.trim()} className="btn-primary text-xs w-full">
                                                        {actionLoading ? 'Posting…' : '📢 Post Announcement'}
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {/* Onboarding steps */}
                                        {rules.onboarding_steps?.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-meta mb-2">ONBOARDING CHECKLIST</p>
                                                <div className="space-y-2">
                                                    {rules.onboarding_steps.map((s, i) => (
                                                        <div key={i} className="paper-card p-3 flex items-start gap-2">
                                                            <div className="w-5 h-5 rounded border border-[var(--border)] flex items-center justify-center mt-0.5 shrink-0">
                                                                <span className="text-[9px] text-[var(--muted)]">{i + 1}</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-[var(--text)]">{s.title}</p>
                                                                {s.description && <p className="text-[11px] text-[var(--muted)] mt-0.5">{s.description}</p>}
                                                                {s.is_required && <span className="text-[9px] text-[var(--accent)] font-medium">Required</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* ─── VAULT ──────────────────────────── */}
                            {tab === 'vault' && (
                                <div>
                                    {isOwner && (
                                        <div className="space-y-3 mb-4">
                                            <p className="text-meta">POST CREDENTIALS</p>
                                            <input type="text" placeholder="Email" value={vaultForm.email} onChange={e => setVaultForm(p => ({ ...p, email: e.target.value }))} className="input w-full text-sm" />
                                            <input type="text" placeholder="Password" value={vaultForm.password} onChange={e => setVaultForm(p => ({ ...p, password: e.target.value }))} className="input w-full text-sm" />
                                            <textarea placeholder="Notes (optional)" value={vaultForm.notes} onChange={e => setVaultForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="input w-full text-sm" />
                                            <button onClick={handlePostVault} disabled={actionLoading || (!vaultForm.email && !vaultForm.password)} className="btn-primary text-xs w-full">
                                                {actionLoading ? 'Encrypting…' : '🔐 Post to Vault'}
                                            </button>
                                            <Divider />
                                        </div>
                                    )}
                                    {vault ? (
                                        <div className="paper-card p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-meta">LATEST CREDENTIALS</p>
                                                <p className="text-[9px] text-[var(--muted)]">{new Date(vault.posted_at).toLocaleString()}</p>
                                            </div>
                                            {/* Email */}
                                            {vault.email && (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2">
                                                        <p className="text-[9px] text-[var(--muted)]">EMAIL</p>
                                                        <p className="text-sm text-[var(--text)] font-mono">{vault.email}</p>
                                                    </div>
                                                    <button onClick={() => copyText(vault.email, 'email', vault._id, 'copy_email')}
                                                        className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-colors" title="Copy email">
                                                        {copied === 'email' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-[var(--muted)]" />}
                                                    </button>
                                                </div>
                                            )}
                                            {/* Password */}
                                            {vault.password && (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2">
                                                        <p className="text-[9px] text-[var(--muted)]">PASSWORD</p>
                                                        <p className="text-sm text-[var(--text)] font-mono">{vault.password}</p>
                                                    </div>
                                                    <button onClick={() => copyText(vault.password, 'password', vault._id, 'copy_password')}
                                                        className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-colors" title="Copy password">
                                                        {copied === 'password' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-[var(--muted)]" />}
                                                    </button>
                                                </div>
                                            )}
                                            {/* Notes */}
                                            {vault.notes && (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2">
                                                        <p className="text-[9px] text-[var(--muted)]">NOTES</p>
                                                        <p className="text-sm text-[var(--text)]">{vault.notes}</p>
                                                    </div>
                                                    <button onClick={() => copyText(vault.notes, 'notes', vault._id, 'copy_notes')}
                                                        className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-colors" title="Copy notes">
                                                        {copied === 'notes' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-[var(--muted)]" />}
                                                    </button>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                                <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                <p className="text-[10px] text-amber-700 dark:text-amber-400">Do not share credentials outside the group.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-caption text-center py-8">No credentials posted yet</p>
                                    )}
                                </div>
                            )}

                            {/* ─── INVITE ─────────────────────────── */}
                            {tab === 'invite' && (
                                <div>
                                    {invite ? (
                                        <div className="paper-card p-4 space-y-3">
                                            <p className="text-meta">INVITE CODE</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2">
                                                    <p className="text-lg font-mono font-bold text-[var(--text)] tracking-widest text-center">{invite.code}</p>
                                                </div>
                                                <button onClick={() => copyText(invite.code, 'code')}
                                                    className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-colors">
                                                    {copied === 'code' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-[var(--muted)]" />}
                                                </button>
                                            </div>
                                            <button onClick={() => copyText(`${BASE}/join/${invite.code}`, 'link')}
                                                className="w-full btn-secondary text-xs flex items-center justify-center gap-1.5">
                                                {copied === 'link' ? <><Check className="w-3 h-3" /> Link copied!</> : <><Link2 className="w-3 h-3" /> Copy invite link</>}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 space-y-3">
                                            <p className="text-caption">Share an invite so friends can join this group</p>
                                            <button onClick={handleCreateInvite} disabled={actionLoading}
                                                className="btn-primary text-xs inline-flex items-center gap-1.5">
                                                {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                                Create Invite Code
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
