import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface MessageRequest {
  senderId: string;
  receiverId: string;
  content: string;
}

export interface MessageResponse {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  senderImageUrl?: string;
  senderName?: string;
  receiverImageUrl?: string;
  receiverName?: string;
  sentAt: string;
  read: boolean;
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lms-backend-0-0-1.onrender.com';

async function requestRaw<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

class ChatSocket {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;
  private connected = false;

  connect(accessToken?: string, onMessage?: (msg: MessageResponse) => void) {
    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${BASE}/ws`),
      reconnectDelay: 5000,
      connectHeaders: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      onConnect: () => {
        this.connected = true;
        // Subscribe to personal queue
        this.subscription = this.client?.subscribe('/user/queue/messages', (message: IMessage) => {
          try {
            const data = JSON.parse(message.body) as MessageResponse;
            onMessage?.(data);
          } catch (e) {
            // ignore
          }
        }) || null;
      },
      onStompError: () => {
        // keep default reconnect
      },
      onWebSocketClose: () => {
        this.connected = false;
      }
    });

    this.client.activate();
  }

  disconnect() {
    try { this.subscription?.unsubscribe(); } catch {}
    this.subscription = null;
    if (this.client) {
      try { this.client.deactivate(); } catch {}
      this.client = null;
    }
    this.connected = false;
  }

  isConnected() {
    return this.connected && !!this.client?.connected;
  }

  sendMessage(req: MessageRequest) {
    if (this.client && this.isConnected()) {
      this.client.publish({ destination: '/app/chat.sendMessage', body: JSON.stringify(req) });
      return true;
    }
    return false;
  }
}

const socket = new ChatSocket();

export const chatService = {
  connect(onMessage?: (msg: MessageResponse) => void) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || undefined : undefined;
    socket.connect(token, onMessage);
  },
  disconnect() {
    socket.disconnect();
  },
  isConnected() {
    return socket.isConnected();
  },
  async listMyMessages(): Promise<MessageResponse[]> {
    return requestRaw<MessageResponse[]>('/api/messages/me', { method: 'GET' });
  },
  async getConversation(user1: string, user2: string): Promise<MessageResponse[]> {
    const params = new URLSearchParams({ user1, user2 });
    return requestRaw<MessageResponse[]>(`/api/messages/conversation?${params.toString()}`, { method: 'GET' });
  },
  async send(req: MessageRequest): Promise<MessageResponse> {
    // Try WS first
    const done = socket.sendMessage(req);
    if (done) {
      // Let server echo to receiver via WS, but return a local echo for sender UX
      return {
        id: Date.now(),
        senderId: req.senderId,
        receiverId: req.receiverId,
        content: req.content,
        sentAt: new Date().toISOString(),
        read: false,
      } as MessageResponse;
    }
    // Fallback HTTP
    return requestRaw<MessageResponse>('/api/messages', { method: 'POST', body: JSON.stringify(req) });
  },
  async markRead(id: number): Promise<void> {
    return requestRaw<void>(`/api/messages/${id}/read`, { method: 'PUT' });
  },
};

export default chatService;
