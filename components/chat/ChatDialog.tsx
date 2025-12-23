import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import chatService, { MessageResponse } from '@/services/chatService';
import userService from '@/services/userService';
import type { UserResponse } from '@/services/authService';

interface ChatDialogProps {
  open: boolean;
  onClose: () => void;
  initialPeer?: { id: string; name?: string } | null;
}

interface Conversation {
  id: string; // peer user id
  name: string;
  avatar?: string;
  lastMessage?: string;
  unread?: number;
}

interface MessageView {
  id: string | number;
  conversationId: string; // peer user id
  senderId: string;
  content: string;
  createdAt: string;
  read?: boolean;
}

const ChatDialog: React.FC<ChatDialogProps> = ({ open, onClose, initialPeer }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, MessageView[]>>({});
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserResponse[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !user?.id) return;
    let mounted = true;

    const build = (list: MessageResponse[]) => {
      const convMap = new Map<string, Conversation>();
      const msgMap: Record<string, MessageView[]> = {};
      list.forEach((m) => {
        const mine = m.senderId === user.id;
        const peerId = mine ? m.receiverId : m.senderId;
        const peerName = mine ? (m.receiverName || m.receiverId) : (m.senderName || m.senderId);
        const item: MessageView = {
          id: m.id,
          conversationId: peerId,
          senderId: m.senderId,
          content: m.content,
          createdAt: (m.sentAt as any) ? String(m.sentAt) : new Date().toISOString(),
          read: m.read,
        };
        if (!msgMap[peerId]) msgMap[peerId] = [];
        msgMap[peerId].push(item);
        const existed = convMap.get(peerId);
        const unreadInc = !mine && !m.read ? 1 : 0;
        if (existed) {
          existed.lastMessage = item.content;
          existed.unread = (existed.unread || 0) + unreadInc;
        } else {
          convMap.set(peerId, { id: peerId, name: peerName, lastMessage: item.content, unread: unreadInc });
        }
      });
      // sort messages inside each conv by time ascending
      Object.values(msgMap).forEach((arr) => arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      if (!mounted) return;
      setMessages(msgMap);
      setConversations(Array.from(convMap.values()));
      setSelected((prev) => prev || (Array.from(convMap.keys())[0] || null));
    };

    chatService.connect(async (incoming) => {
      if (!mounted || !user?.id) return;
      const mine = incoming.senderId === user.id;
      const peerId = mine ? incoming.receiverId : incoming.senderId;
      const msg: MessageView = {
        id: incoming.id,
        conversationId: peerId,
        senderId: incoming.senderId,
        content: incoming.content,
        createdAt: (incoming.sentAt as any) ? String(incoming.sentAt) : new Date().toISOString(),
        read: incoming.read,
      };
      setMessages((prev) => ({ ...prev, [peerId]: [...(prev[peerId] || []), msg] }));
      setConversations((prev) => {
        const name = mine ? (incoming.receiverName || incoming.receiverId) : (incoming.senderName || incoming.senderId);
        const list = [...prev];
        const idx = list.findIndex((c) => c.id === peerId);
        if (idx >= 0) {
          const updated = { ...list[idx] };
          updated.lastMessage = msg.content;
          if (!mine && selected !== peerId) updated.unread = (updated.unread || 0) + 1;
          list.splice(idx, 1);
          list.unshift(updated);
        } else {
          list.unshift({ id: peerId, name, lastMessage: msg.content, unread: !mine && selected !== peerId ? 1 : 0 });
        }
        return list;
      });
      if (selected === peerId && !mine && incoming.id) {
        try { await chatService.markRead(incoming.id); } catch {}
      }
    });

    chatService.listMyMessages()
      .then(build)
      .catch(() => {});

    return () => {
      mounted = false;
      chatService.disconnect();
    };
  }, [open, user?.id]);

  // Open specific peer when provided from outside (e.g., "Chat with instructor")
  useEffect(() => {
    if (!open || !user?.id || !initialPeer?.id) return;
    const peerId = initialPeer.id;
    const peerName = initialPeer.name || peerId;
    const exists = conversations.find((c) => c.id === peerId);
    if (!exists) {
      setConversations((prev) => [{ id: peerId, name: peerName, lastMessage: '', unread: 0 }, ...prev]);
    }
    (async () => {
      try {
        const history = await chatService.getConversation(user.id, peerId);
        const mapped: MessageView[] = history.map((m) => ({
          id: m.id,
          conversationId: m.senderId === user.id ? m.receiverId : m.senderId,
          senderId: m.senderId,
          content: m.content,
          createdAt: (m.sentAt as any) ? String(m.sentAt) : new Date().toISOString(),
          read: m.read,
        }));
        setMessages((prev) => ({ ...prev, [peerId]: mapped }));
      } catch {}
      setSelected(peerId);
    })();
  }, [open, initialPeer?.id, initialPeer?.name, user?.id, conversations]);

  // Debounced search users by name for starting new conversation (instructor/admin)
  useEffect(() => {
    let timer: any;
    const canSearchServer = user?.role?.name === 'INSTRUCTOR' || user?.role?.name === 'ADMIN';
    if (!open || !query || query.trim().length < 2 || !canSearchServer) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    timer = setTimeout(async () => {
      try {
        const res = await userService.searchUsers(query.trim(), 0, 10);
        const items = (res.content || []).filter((u) => u.id !== user?.id);
        setSearchResults(items);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [open, query, user?.id, user?.role?.name]);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [open, selected, messages]);

  const selectedMessages = useMemo(() => (selected ? (messages[selected] || []) : []), [messages, selected]);
  const selectedConversation = useMemo(() => conversations.find((c) => c.id === selected) || null, [conversations, selected]);
  const filteredConversations = useMemo(
    () => conversations.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())),
    [conversations, query]
  );

  const handleSend = async () => {
    if (!input.trim() || !selected || !user?.id) return;
    const content = input.trim();
    setInput('');
    try {
      const local = await chatService.send({ senderId: user.id, receiverId: selected, content });
      const msg: MessageView = {
        id: local.id || `local-${Date.now()}`,
        conversationId: selected,
        senderId: user.id,
        content,
        createdAt: (local.sentAt as any) ? String(local.sentAt) : new Date().toISOString(),
        read: true,
      };
      setMessages((prev) => ({ ...prev, [selected]: [...(prev[selected] || []), msg] }));
      setConversations((prev) => {
        const updated = prev.map((c) => (c.id === selected ? { ...c, lastMessage: msg.content } : c));
        updated.sort((a, b) => (a.id === selected ? -1 : b.id === selected ? 1 : 0));
        return updated;
      });
    } catch {}
  };

  const handleSelect = async (peerId: string) => {
    setSelected(peerId);
    const list = messages[peerId] || [];
    const unreadFromPeer = list.filter((m) => m.senderId !== user?.id && !m.read);
    for (const m of unreadFromPeer) {
      try { await chatService.markRead(Number(m.id)); m.read = true; } catch {}
    }
    setConversations((prev) => prev.map((c) => (c.id === peerId ? { ...c, unread: 0 } : c)));
  };

  const handlePickUser = async (u: UserResponse) => {
    if (!user?.id) return;
    const exists = conversations.find((c) => c.id === u.id);
    if (!exists) {
      setConversations((prev) => [{ id: u.id, name: u.fullName || u.email, lastMessage: '', unread: 0 }, ...prev]);
    }
    // load history
    try {
      const history = await chatService.getConversation(user.id, u.id);
      const mapped: MessageView[] = history.map((m) => ({
        id: m.id,
        conversationId: m.senderId === user.id ? m.receiverId : m.senderId,
        senderId: m.senderId,
        content: m.content,
        createdAt: (m.sentAt as any) ? String(m.sentAt) : new Date().toISOString(),
        read: m.read,
      }));
      setMessages((prev) => ({ ...prev, [u.id]: mapped }));
    } catch {}
    setSelected(u.id);
    setQuery('');
    setSearchResults([]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="pointer-events-auto fixed bottom-6 right-6 w-[92vw] max-w-5xl h-[70vh] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-12 border-b border-gray-200">
          <div className="font-semibold text-gray-900">Tin nhắn</div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="flex flex-1 min-h-0">
          <div className="w-72 border-r border-gray-200 hidden sm:flex sm:flex-col">
            <div className="p-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {(filteredConversations.length > 0 ? filteredConversations : conversations).map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c.id)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 ${selected === c.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm">
                    {c.name.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{c.name}</div>
                    <div className="text-xs text-gray-500 truncate">{c.lastMessage || ''}</div>
                  </div>
                  {c.unread ? (
                    <span className="ml-2 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">{c.unread}</span>
                  ) : null}
                </button>
              ))}
              {conversations.length === 0 && (
                <div className="text-sm text-gray-600 px-4 py-6">Chưa có hội thoại</div>
              )}
              {conversations.length > 0 && filteredConversations.length === 0 && query && (
                <div className="text-sm text-gray-600 px-4 py-6">Không tìm thấy hội thoại phù hợp</div>
              )}
              {query && (user?.role?.name === 'INSTRUCTOR' || user?.role?.name === 'ADMIN') && (
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="px-4 py-2 text-xs text-gray-500">Kết quả tìm theo tên</div>
                  {searching && <div className="px-4 py-2 text-sm text-gray-500">Đang tìm...</div>}
                  {!searching && searchResults.length === 0 && query.trim().length >= 2 && (
                    <div className="px-4 py-2 text-sm text-gray-500">Không tìm thấy người dùng</div>
                  )}
                  {!searching && searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handlePickUser(u)}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm">
                        {(u.fullName || u.email || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{u.fullName || u.email}</div>
                        {u.email && <div className="text-xs text-gray-500 truncate">{u.email}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-900">{selectedConversation?.name || 'Chọn hội thoại'}</div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {selected ? (
                selectedMessages.map((m) => {
                  const mine = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`${mine ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'} px-3 py-2 rounded-lg shadow-sm max-w-[70%] whitespace-pre-wrap break-words`}>
                        <div className="text-sm">{m.content}</div>
                        <div className={`text-[10px] mt-1 ${mine ? 'text-blue-100' : 'text-gray-400'}`}>{new Date(m.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-600">Chọn một hội thoại để bắt đầu</div>
              )}
            </div>
            <div className="p-3 border-t border-gray-200 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Nhập tin nhắn..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <Button size="sm" variant="primary" onClick={handleSend}>Gửi</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDialog;
