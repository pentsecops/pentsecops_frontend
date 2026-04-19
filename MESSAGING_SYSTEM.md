# Real-Time Messaging & Notification System

## Overview
A comprehensive real-time communication system built with WebSockets featuring WhatsApp-style messaging, priority-based notifications, and file attachments.

## Features

### 1. Real-Time Chat System
- **1-to-1 Messaging**: Direct messaging between users
- **Message Status**: SENT → DELIVERED → READ with visual indicators
- **Typing Indicators**: Real-time typing status
- **File Attachments**: Support for images, PDFs, and documents (max 10MB)
- **Message History**: Persistent chat history with pagination
- **Unread Counts**: Badge indicators for unread messages

### 2. Notification System
- **Priority Levels**: LOW, MEDIUM, HIGH, CRITICAL
- **Delivery Channels**: In-app (WebSocket) and Email
- **Notification Types**: 
  - Single user notifications
  - Multiple user notifications
  - Broadcast to all users
- **Read Receipts**: Track notification read status
- **Real-time Updates**: Instant notification delivery via WebSocket

### 3. WebSocket Architecture
- **Ping-Pong Mechanism**: Heartbeat every 30 seconds to maintain connection
- **Auto-Reconnection**: Automatic reconnection with exponential backoff
- **Connection Status**: Visual indicators (Wifi/WifiOff icons)
- **Message Queue**: Offline message queuing and delivery on reconnect

## Components

### Frontend Components

#### 1. `MessagingPanel.tsx`
Main chat interface with WhatsApp-style design:
- Conversation list with search
- Chat area with message bubbles
- File attachment preview
- Typing indicators
- Message status icons (✓ sent, ✓✓ delivered, ✓✓ read)

#### 2. `NotificationsCenter.tsx`
Notification management interface:
- Priority-based color coding
- Filter by all/unread
- Mark as read functionality
- Toast notifications for new alerts
- Delivery channel indicators (in-app/email)

#### 3. `MessagingDashboard.tsx`
Combined dashboard with tabs:
- Messages tab
- Notifications tab
- Unified communication center

#### 4. `NotificationBadge.tsx`
Header badge component:
- Unread count display
- Animated bell icon
- Click to open notifications

### Services

#### 1. `websocketService.ts`
WebSocket connection management:
```typescript
// Connect to WebSocket
websocketService.connect();

// Send message
websocketService.sendMessage(receiverId, message, attachments);

// Send typing indicator
websocketService.sendTypingIndicator(receiverId, isTyping);

// Mark message as read
websocketService.markMessageAsRead(messageId);

// Subscribe to events
websocketService.onMessage(handler);
websocketService.onNotification(handler);
websocketService.onTyping(handler);
websocketService.onConnectionChange(handler);
```

#### 2. `messagingApi.ts`
REST API integration:
```typescript
// Get conversations
await messagingApi.getConversations();

// Get chat history
await messagingApi.getChatHistory(userId, page, limit);

// Upload attachment
await messagingApi.uploadAttachment(file);

// Get notifications
await messagingApi.getNotifications(page, limit);

// Mark notification as read
await messagingApi.markNotificationAsRead(notificationId);

// Get unread counts
await messagingApi.getUnreadCounts();
```

## Data Models

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  attachments?: string[];
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  sender_name?: string;
  sender_email?: string;
}
```

### Notification
```typescript
interface Notification {
  id: string;
  sender_id: string;
  receiver_type: 'ALL' | 'SINGLE' | 'MULTIPLE';
  receiver_ids?: string[];
  subject: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  in_app: boolean;
  email: boolean;
  created_at: string;
  delivered_at?: string;
  is_read?: boolean;
}
```

## WebSocket Protocol

### Connection
```
ws://backend_url/ws?token=<access_token>
```

### Message Types

#### Client → Server
```json
// Send message
{
  "type": "message",
  "payload": {
    "receiver_id": "uuid",
    "message": "Hello",
    "attachments": ["url1", "url2"]
  }
}

// Typing indicator
{
  "type": "typing",
  "payload": {
    "receiver_id": "uuid",
    "is_typing": true
  }
}

// Mark as read
{
  "type": "mark_read",
  "payload": {
    "message_id": "uuid"
  }
}

// Ping
{
  "type": "ping"
}
```

#### Server → Client
```json
// New message
{
  "type": "message",
  "payload": {
    "id": "uuid",
    "sender_id": "uuid",
    "receiver_id": "uuid",
    "message": "Hello",
    "status": "SENT",
    "sent_at": "2026-04-10T10:00:00Z"
  }
}

// Notification
{
  "type": "notification",
  "payload": {
    "id": "uuid",
    "subject": "New Alert",
    "message": "You have a new task",
    "priority": "HIGH"
  }
}

// Typing indicator
{
  "type": "typing",
  "payload": {
    "user_id": "uuid",
    "user_name": "John Doe",
    "is_typing": true
  }
}

// Message status update
{
  "type": "message_status",
  "payload": {
    "message_id": "uuid",
    "status": "DELIVERED",
    "delivered_at": "2026-04-10T10:00:01Z"
  }
}

// Pong
{
  "type": "pong"
}
```

## File Attachments

### Supported Types
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`
- Documents: `.pdf`, `.doc`, `.docx`

### Size Limits
- Maximum file size: 10MB per file
- Multiple files supported

### Upload Flow
1. User selects files
2. Files validated (size, type)
3. Files uploaded via REST API
4. File URLs returned
5. URLs included in message payload
6. Message sent via WebSocket

## Security

### Authentication
- JWT token-based authentication
- Token passed in WebSocket connection URL
- Token validated on connection

### Authorization
- Users can only message other users
- Users can only see their own conversations
- Admins can broadcast notifications

### File Upload
- File type validation
- File size limits
- Sanitized file names
- Secure storage paths

## UI/UX Features

### Message Bubbles
- Own messages: Cyan background, right-aligned
- Received messages: Gray background, left-aligned
- Rounded corners with padding
- Timestamp and status icons

### Status Indicators
- ✓ Single check: Sent
- ✓✓ Double check (gray): Delivered
- ✓✓ Double check (blue): Read

### Typing Indicator
- "typing..." text in cyan color
- Appears below user name
- Auto-clears after 1 second of inactivity

### Connection Status
- Green Wifi icon: Connected
- Red WifiOff icon: Disconnected
- Automatic reconnection attempts

### Notifications
- Toast popups for new notifications
- Priority-based color coding:
  - CRITICAL: Red
  - HIGH: Orange
  - MEDIUM: Yellow
  - LOW: Blue
- Animated bell icon on new notification
- Unread badge with count

## Integration

### Add to Dashboard
```typescript
import { MessagingDashboard } from './messaging/MessagingDashboard';

// In your dashboard tabs
<TabsContent value="messages">
  <MessagingDashboard />
</TabsContent>
```

### Add Notification Badge
```typescript
import { NotificationBadge } from './messaging/NotificationBadge';

// In your header
<NotificationBadge onClick={() => setActiveTab('messages')} />
```

## Backend Requirements

### REST API Endpoints
- `GET /v1/messaging/users` - Get all users
- `GET /v1/messaging/conversations` - Get conversations
- `GET /v1/messaging/chat/:userId` - Get chat history
- `POST /v1/messaging/upload` - Upload attachment
- `GET /v1/notifications` - Get notifications
- `PUT /v1/notifications/:id/read` - Mark as read
- `GET /v1/messaging/unread-counts` - Get unread counts

### WebSocket Endpoint
- `ws://backend_url/ws?token=<token>`

### Database Tables
- `chats` - Message storage
- `notifications` - Notification storage
- `chat_attachments` - File metadata

## Performance Considerations

### Optimization
- Message pagination (50 messages per page)
- Lazy loading of conversations
- Debounced typing indicators
- Connection pooling
- Message caching

### Scalability
- Horizontal scaling with Redis pub/sub
- Load balancing for WebSocket connections
- CDN for file attachments
- Database indexing on user_id and timestamps

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies
- `lucide-react` - Icons
- `sonner` - Toast notifications
- `date-fns` - Date formatting (optional)
- WebSocket API (native)

## Future Enhancements
- [ ] Group messaging
- [ ] Message editing/deletion
- [ ] Voice messages
- [ ] Video calls
- [ ] Message search
- [ ] Message reactions
- [ ] Push notifications (mobile)
- [ ] End-to-end encryption
- [ ] Message forwarding
- [ ] Media gallery view
