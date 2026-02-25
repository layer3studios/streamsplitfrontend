'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import AuthModal from '../../components/ui/AuthModal';
import AuthGate from '../../components/ui/AuthGate';
import { MotionPage } from '../../components/ui/Motion';
import { Container, SectionHeader, Divider } from '../../components/ui/Layout';
import EmptyState from '../../components/ui/EmptyState';
import { ListSkeleton } from '../../components/ui/Skeleton';
import { useStore } from '../../lib/store';
import api from '../../lib/api';
import { io } from 'socket.io-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

export default function ChatPage() {
  const { isAuthenticated, user } = useStore();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    Promise.all([api.getMyGroups(), api.getOwnedGroups()]).then(([myRes, ownRes]) => {
      const all = [...(ownRes.data || []), ...(myRes.data || [])];
      const unique = all.filter((g, i, a) => a.findIndex(x => x._id === g._id) === i);
      setGroups(unique);
      setLoading(false);
    });
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selectedGroup || !isAuthenticated) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;

    const socket = io(API_BASE, { auth: { token }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.emit('join_group', selectedGroup._id);
    socket.on('chat_history', (history) => setMessages(history || []));
    socket.on('new_message', (msg) => setMessages(prev => [...prev, msg]));

    return () => { socket.disconnect(); };
  }, [selectedGroup, isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMsg.trim() || !socketRef.current || !selectedGroup) return;
    socketRef.current.emit('send_message', { group_id: selectedGroup._id, message: newMsg.trim() });
    setNewMsg('');
  };

  return (
    <div className="min-h-screen"><Header /><AuthModal />
      <MotionPage>
        <AuthGate>
          <section className="pt-16 md:pt-14">
            <div className="flex h-[calc(100vh-56px)] md:h-[calc(100vh-56px)]">

              {/* Sidebar */}
              <div className={`${selectedGroup ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-[var(--border)] bg-[var(--bg)]`}>
                <div className="p-4 border-b border-[var(--border)]">
                  <p className="text-meta">CONVERSATIONS</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loading ? <div className="p-4"><ListSkeleton rows={4} /></div> : groups.length === 0 ? (
                    <EmptyState icon={MessageCircle} title="No groups" description="Join a group to start chatting" actionLabel="Browse Groups" actionHref="/groups" />
                  ) : (
                    groups.map(group => (
                      <button
                        key={group._id}
                        onClick={() => setSelectedGroup(group)}
                        className={`w-full text-left p-4 border-b border-[var(--border)] transition-colors ${selectedGroup?._id === group._id ? 'bg-[var(--surface)]' : 'hover:bg-[var(--surface)]'
                          }`}
                      >
                        <p className="text-sm font-medium text-[var(--text)] truncate">{group.name}</p>
                        <p className="text-meta text-[10px] mt-0.5">{group.brand_id?.name || 'Group'}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className={`${selectedGroup ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-[var(--bg2)]`}>
                {selectedGroup ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center gap-3">
                      <button onClick={() => setSelectedGroup(null)} className="md:hidden btn-ghost text-sm">←</button>
                      <div>
                        <p className="text-sm font-medium text-[var(--text)]">{selectedGroup.name}</p>
                        <p className="text-meta text-[10px]">{selectedGroup.member_count || 0} members</p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.map((msg, i) => {
                        const isOwn = msg.sender_id === user?._id || msg.sender_id?._id === user?._id;
                        return (
                          <div key={msg._id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isOwn
                                ? 'bg-[var(--text)] text-[var(--bg2)] rounded-br-md'
                                : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-bl-md'
                              }`}>
                              {!isOwn && (
                                <p className="text-[10px] font-medium opacity-60 mb-0.5">
                                  {msg.sender_id?.name || 'User'}
                                </p>
                              )}
                              <p className="text-sm leading-relaxed">{msg.message || msg.content}</p>
                              <p className={`text-[9px] mt-1 ${isOwn ? 'opacity-50' : 'text-[var(--muted)]'}`}>
                                {new Date(msg.created_at || msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Composer */}
                    <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)]">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type a message..."
                          value={newMsg}
                          onChange={e => setNewMsg(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendMessage()}
                          className="input flex-1"
                        />
                        <button onClick={sendMessage} disabled={!newMsg.trim()} className="btn-primary p-2.5 rounded-full">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <EmptyState icon={MessageCircle} title="Select a conversation" description="Choose a group from the sidebar" />
                  </div>
                )}
              </div>

            </div>
          </section>
        </AuthGate>
      </MotionPage>
      <MobileNav />
    </div>
  );
}
