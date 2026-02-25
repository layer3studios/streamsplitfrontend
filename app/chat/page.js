'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, MessageCircle, Users, Hash, User as UserIcon, Info, Pin, Shield, Megaphone, Key, Ticket } from 'lucide-react';
import JoinByCodeModal from '../../components/join/JoinByCodeModal';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import AuthModal from '../../components/ui/AuthModal';
import AuthGate from '../../components/ui/AuthGate';
import { MotionPage } from '../../components/ui/Motion';
import EmptyState from '../../components/ui/EmptyState';
import { ListSkeleton } from '../../components/ui/Skeleton';
import UserAvatar from '../../components/ui/UserAvatar';
import GroupSeatPills from '../../components/group/GroupSeatPills';
import GroupRosterPanel from '../../components/group/GroupRosterPanel';
import GroupInfoDrawer from '../../components/group/GroupInfoDrawer';
import { useStore } from '../../lib/store';
import api from '../../lib/api';
import { io } from 'socket.io-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

function MessageBubble({ msg, isOwn, user }) {
  const time = new Date(msg.createdAt || msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // System message
  if (msg.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)]">
          <Info className="w-3 h-3 text-[var(--muted)]" />
          <p className="text-[11px] text-[var(--muted)]">{msg.content}</p>
        </div>
      </div>
    );
  }

  // Announcement
  if (msg.type === 'announcement') {
    return (
      <div className="my-2">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Megaphone className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 tracking-wider">ANNOUNCEMENT</span>
            {msg.pinned && <Pin className="w-3 h-3 text-amber-600 ml-auto" />}
          </div>
          <p className="text-sm text-[var(--text)] leading-relaxed">{msg.content}</p>
          <p className="text-[9px] text-amber-600/60 mt-1">{msg.sender_id?.name} · {time}</p>
        </div>
      </div>
    );
  }

  // Vault message
  if (msg.type === 'vault') {
    return (
      <div className="my-2">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Key className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 tracking-wider">VAULT UPDATE</span>
          </div>
          <p className="text-sm text-[var(--text)]">{msg.content}</p>
          <p className="text-[9px] text-emerald-600/60 mt-1">{msg.sender_id?.name} · {time}</p>
          <p className="text-[9px] text-[var(--muted)] mt-0.5">Open Group Info → Vault tab to view credentials</p>
        </div>
      </div>
    );
  }

  // Regular text/image message
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isOwn
        ? 'bg-[var(--text)] text-[var(--bg2)] rounded-br-md'
        : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-bl-md'
        }`}>
        {!isOwn && (
          <p className="text-[10px] font-medium opacity-60 mb-0.5">
            {msg.sender_id?.name || 'User'}
          </p>
        )}
        <p className="text-sm leading-relaxed">{msg.content || msg.message}</p>
        <p className={`text-[9px] mt-1 ${isOwn ? 'opacity-50' : 'text-[var(--muted)]'}`}>{time}</p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useStore();
  const [rooms, setRooms] = useState({ groups: [], dms: [] });
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('groups');
  const [showRoster, setShowRoster] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const prevRoomRef = useRef(null);

  // Load rooms
  const loadRooms = useCallback(async () => {
    if (!isAuthenticated) { setLoading(false); return; }
    setLoading(true);
    const res = await api.getChatRooms();
    if (res.success) setRooms(res.data);
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  // Handle ?room= query param
  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam && !activeRoom) {
      const all = [...rooms.groups, ...rooms.dms];
      const found = all.find(r => r._id === roomParam);
      if (found) selectRoom(found);
    }
  }, [searchParams, rooms]);

  const selectRoom = (room) => {
    setActiveRoom({
      _id: room._id,
      type: room.type,
      name: room.type === 'group' ? room.group?.name : room.other_user?.name,
      groupId: room.type === 'group' ? room.group?._id : null,
      memberCount: room.group?.member_count,
      shareLimit: room.group?.share_limit,
      otherUserId: room.other_user?._id,
    });
    setMessages([]);
    setShowInfo(false);
  };

  // Socket connection per room
  useEffect(() => {
    if (!activeRoom || !isAuthenticated) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) return;

    if (socketRef.current) {
      if (prevRoomRef.current) socketRef.current.emit('leave_room', prevRoomRef.current);
      socketRef.current.disconnect();
    }

    const socket = io(API_BASE, { auth: { token }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    prevRoomRef.current = activeRoom._id;

    socket.emit('join_room', activeRoom._id);
    socket.on('message_history', (history) => setMessages(history || []));
    socket.on('new_message', (msg) => setMessages(prev => [...prev, msg]));

    return () => { socket.disconnect(); };
  }, [activeRoom, isAuthenticated]);

  // Scroll to bottom
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = () => {
    if (!newMsg.trim() || !socketRef.current || !activeRoom) return;
    socketRef.current.emit('send_message', { room_id: activeRoom._id, content: newMsg.trim() });
    setNewMsg('');
  };

  // Pinned announcement
  const pinnedAnn = useMemo(() => messages.find(m => m.type === 'announcement' && m.pinned), [messages]);

  const currentList = tab === 'groups' ? rooms.groups : rooms.dms;

  return (
    <div className="min-h-screen"><Header /><AuthModal />
      <MotionPage>
        <AuthGate>
          <section className="pt-16 md:pt-14">
            <div className="flex h-[calc(100vh-56px)]">

              {/* ─── Sidebar ─────────────────────────── */}
              <div className={`${activeRoom ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-[var(--border)] bg-[var(--bg)]`}>
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                  <p className="text-meta">CHAT</p>
                  <button onClick={() => setShowJoinModal(true)} className="text-[10px] text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1">
                    <Ticket className="w-3 h-3" /> Join by code
                  </button>
                </div>

                <div className="flex border-b border-[var(--border)]">
                  <button onClick={() => setTab('groups')}
                    className={`flex-1 py-2.5 text-xs font-medium tracking-wider transition-colors ${tab === 'groups' ? 'text-[var(--text)] border-b-2 border-[var(--text)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}>
                    <Hash className="w-3 h-3 inline mr-1" />GROUPS
                    {rooms.groups.length > 0 && <span className="ml-1 text-[9px] opacity-60">({rooms.groups.length})</span>}
                  </button>
                  <button onClick={() => setTab('direct')}
                    className={`flex-1 py-2.5 text-xs font-medium tracking-wider transition-colors ${tab === 'direct' ? 'text-[var(--text)] border-b-2 border-[var(--text)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}>
                    <UserIcon className="w-3 h-3 inline mr-1" />DIRECT
                    {rooms.dms.length > 0 && <span className="ml-1 text-[9px] opacity-60">({rooms.dms.length})</span>}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-4"><ListSkeleton rows={4} /></div>
                  ) : currentList.length === 0 ? (
                    tab === 'groups' ? (
                      <EmptyState icon={Hash} title="No groups" description="Join a group to start chatting" actionLabel="Browse Groups" actionHref="/groups">
                        <button onClick={() => setShowJoinModal(true)} className="btn-secondary text-xs py-2 px-4 mt-3 inline-flex items-center gap-1">
                          <Ticket className="w-3.5 h-3.5" /> Join by code
                        </button>
                      </EmptyState>
                    ) : (
                      <EmptyState icon={MessageCircle} title="No DMs" description="Message a friend to start" actionLabel="Find Friends" actionHref="/friends" />
                    )
                  ) : (
                    currentList.map(room => (
                      <button key={room._id} onClick={() => selectRoom(room)}
                        className={`w-full text-left p-3 border-b border-[var(--border)] transition-colors ${activeRoom?._id === room._id ? 'bg-[var(--surface)]' : 'hover:bg-[var(--surface)]'}`}>
                        <div className="flex items-center gap-3">
                          {room.type === 'group' ? (
                            <div className="w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0">
                              <Hash className="w-4 h-4 text-[var(--muted)]" />
                            </div>
                          ) : (
                            <UserAvatar name={room.other_user?.name} userId={room.other_user?._id} size={36} />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text)] truncate">{room.type === 'group' ? room.group?.name : room.other_user?.name}</p>
                            {room.last_message_preview ? (
                              <p className="text-[11px] text-[var(--muted)] truncate">{room.last_message_preview}</p>
                            ) : (
                              <p className="text-[11px] text-[var(--muted)] italic">No messages yet</p>
                            )}
                          </div>
                          {room.type === 'group' && room.group && (
                            <GroupSeatPills memberCount={room.group.member_count} shareLimit={room.group.share_limit} />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* ─── Chat Area ────────────────────────── */}
              <div className={`${activeRoom ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-[var(--bg2)]`}>
                {activeRoom ? (
                  <>
                    {/* Thread Header */}
                    <div className="p-3 border-b border-[var(--border)] bg-[var(--surface)] flex items-center gap-3">
                      <button onClick={() => setActiveRoom(null)} className="md:hidden btn-ghost text-sm p-1">←</button>
                      {activeRoom.type === 'group' ? (
                        <div className="w-8 h-8 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center">
                          <Hash className="w-3.5 h-3.5 text-[var(--muted)]" />
                        </div>
                      ) : (
                        <UserAvatar name={activeRoom.name} userId={activeRoom.otherUserId} size={32} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text)] truncate">{activeRoom.name}</p>
                        {activeRoom.type === 'group' && (
                          <p className="text-[10px] text-[var(--muted)]">{activeRoom.memberCount || 0} members</p>
                        )}
                      </div>
                      {activeRoom.type === 'group' && activeRoom.groupId && (
                        <>
                          <GroupSeatPills memberCount={activeRoom.memberCount} shareLimit={activeRoom.shareLimit} />
                          <button onClick={() => setShowRoster(true)}
                            className="p-2 rounded-xl hover:bg-[var(--bg)] border border-[var(--border)] transition-colors" title="Members">
                            <Users className="w-4 h-4 text-[var(--text)]" />
                          </button>
                          <button onClick={() => setShowInfo(true)}
                            className="p-2 rounded-xl hover:bg-[var(--bg)] border border-[var(--border)] transition-colors" title="Group info">
                            <Info className="w-4 h-4 text-[var(--text)]" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Pinned announcement banner */}
                    {pinnedAnn && (
                      <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2">
                        <Pin className="w-3 h-3 text-amber-600 shrink-0" />
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 truncate flex-1">{pinnedAnn.content}</p>
                        <span className="text-[9px] text-amber-500 shrink-0">PINNED</span>
                      </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.length === 0 && (
                        <p className="text-center text-caption text-sm py-8">No messages yet. Say hello!</p>
                      )}
                      {messages.map((msg, i) => {
                        const isOwn = msg.sender_id === user?._id || msg.sender_id?._id === user?._id;
                        return <MessageBubble key={msg._id || i} msg={msg} isOwn={isOwn} user={user} />;
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Composer */}
                    <div className="p-3 border-t border-[var(--border)] bg-[var(--surface)]">
                      <div className="flex items-center gap-2">
                        <input type="text" placeholder="Type a message..." value={newMsg}
                          onChange={e => setNewMsg(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendMessage()}
                          className="input flex-1" />
                        <button onClick={sendMessage} disabled={!newMsg.trim()} className="btn-primary p-2.5 rounded-full">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <EmptyState icon={MessageCircle} title="Select a conversation" description="Choose a chat from the sidebar" />
                  </div>
                )}
              </div>

            </div>
          </section>
        </AuthGate>
      </MotionPage>
      <MobileNav />

      {showRoster && activeRoom?.groupId && (
        <GroupRosterPanel groupId={activeRoom.groupId} onClose={() => setShowRoster(false)} />
      )}
      {showInfo && activeRoom?.groupId && (
        <GroupInfoDrawer groupId={activeRoom.groupId} groupName={activeRoom.name} onClose={() => setShowInfo(false)} />
      )}
      <JoinByCodeModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
    </div>
  );
}
