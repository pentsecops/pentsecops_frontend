import { TokenStorage } from './tokenStorage';

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface MessageAttachment {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  sent_at: string;
  read_at?: string;
  attachments?: MessageAttachment[];
}

export interface Notification {
  id: string;
  sender_id: string;
  receiver_type: 'single' | 'multiple' | 'broadcast';
  receiver_ids?: string[];
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  in_app: boolean;
  email: boolean;
  created_at: string;
  delivered_at?: string;
  is_read?: boolean;
}

export interface TypingIndicator {
  user_id: string;
  user_name: string;
  is_typing: boolean;
}

type MessageHandler = (message: ChatMessage) => void;
type NotificationHandler = (notification: Notification) => void;
type TypingHandler = (typing: TypingIndicator) => void;
type ConnectionHandler = (connected: boolean) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 2000;
  private pingInterval: NodeJS.Timeout | null = null;
  private pongTimeout: NodeJS.Timeout | null = null;
  private messageHandlers: MessageHandler[] = [];
  private notificationHandlers: NotificationHandler[] = [];
  private typingHandlers: TypingHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];
  private isConnecting = false;
  private shouldReconnect = true;
  private reconnectTimer: NodeJS.Timeout | null = null;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.shouldReconnect = true;
    const token = TokenStorage.getAccessToken();
    
    if (!token) {
      console.error('No access token available for WebSocket connection');
      this.isConnecting = false;
      return;
    }

    const wsUrl = import.meta.env.VITE_API_BASE_URL?.replace('http', 'ws').replace('/api', '') || 'ws://localhost:8080';
    const wsEndpoint = `${wsUrl}/ws?token=${token}`;

    console.log('Connecting to WebSocket:', wsEndpoint);

    try {
      this.ws = new WebSocket(wsEndpoint);

      this.ws.onopen = () => {
        console.log('✓ WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startPingPong();
        this.notifyConnectionHandlers(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
        this.isConnecting = false;
        this.stopPingPong();
        this.notifyConnectionHandlers(false);
        
        if (this.shouldReconnect) {
          this.attemptReconnect();
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'pong':
        this.handlePong();
        break;
      case 'message':
        this.notifyMessageHandlers(data.payload);
        break;
      case 'notification':
        this.notifyNotificationHandlers(data.payload);
        break;
      case 'typing':
        this.notifyTypingHandlers(data.payload);
        break;
      case 'message_status':
        this.handleMessageStatus(data.payload);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  private startPingPong() {
    // Clear any existing interval
    this.stopPingPong();
    
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
        
        // Set timeout for pong response
        this.pongTimeout = setTimeout(() => {
          console.warn('No pong received within 10 seconds, connection may be dead');
          // Attempt to reconnect if pong timeout occurs
          this.shouldReconnect = true;
          this.ws?.close();
        }, 10000);
      }
    }, 30000); // Ping every 30 seconds
  }

  private handlePong() {
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
      console.log('✓ Pong received, connection alive');
    }
  }

  private stopPingPong() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  private attemptReconnect() {
    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.shouldReconnect = false;
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * this.reconnectAttempts, 30000); // Max 30 seconds
    console.log(`Attempting to reconnect in ${delay}ms (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  sendMessage(receiverId: string, message: string, attachments?: string[]) {
    // Don't send via WebSocket, use REST API instead
    console.log('Message will be sent via REST API, not WebSocket');
  }

  sendTypingIndicator(receiverId: string, isTyping: boolean) {
    // Typing indicators via WebSocket
    this.send({
      type: 'typing',
      payload: {
        receiver_id: receiverId,
        is_typing: isTyping,
      },
    });
  }

  markMessageAsRead(messageId: string) {
    // Don't send via WebSocket, use REST API instead
    console.log('Mark as read will be done via REST API, not WebSocket');
  }

  private handleMessageStatus(payload: any) {
    // Update message status in handlers
    this.notifyMessageHandlers(payload);
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onNotification(handler: NotificationHandler) {
    this.notificationHandlers.push(handler);
    return () => {
      this.notificationHandlers = this.notificationHandlers.filter((h) => h !== handler);
    };
  }

  onTyping(handler: TypingHandler) {
    this.typingHandlers.push(handler);
    return () => {
      this.typingHandlers = this.typingHandlers.filter((h) => h !== handler);
    };
  }

  onConnectionChange(handler: ConnectionHandler) {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter((h) => h !== handler);
    };
  }

  private notifyMessageHandlers(message: ChatMessage) {
    this.messageHandlers.forEach((handler) => handler(message));
  }

  private notifyNotificationHandlers(notification: Notification) {
    this.notificationHandlers.forEach((handler) => handler(notification));
  }

  private notifyTypingHandlers(typing: TypingIndicator) {
    this.typingHandlers.forEach((handler) => handler(typing));
  }

  private notifyConnectionHandlers(connected: boolean) {
    this.connectionHandlers.forEach((handler) => handler(connected));
  }

  disconnect() {
    this.shouldReconnect = false;
    this.stopPingPong();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();
