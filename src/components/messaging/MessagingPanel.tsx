import { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Send,
  Paperclip,
  Search,
  MoreVertical,
  Check,
  CheckCheck,
  Loader2,
  X,
  FileText,
  Wifi,
  WifiOff,
  Plus,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { toast } from 'sonner';
import { websocketService, ChatMessage } from '../../services/websocketService';
import { messagingApi, User, ChatConversation, MessageAttachment } from '../../services/messagingApi';
import { TokenStorage } from '../../services/tokenStorage';

export function MessagingPanel() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadConversations();
    loadUnreadCount();
    
    if (!websocketService.isConnected()) {
      websocketService.connect();
    }

    const unsubscribeMessage = websocketService.onMessage((message) => {
      handleNewMessage(message);
      loadConversations();
    });
    const unsubscribeTyping = websocketService.onTyping(handleTyping);
    const unsubscribeConnection = websocketService.onConnectionChange(setIsConnected);

    const unreadInterval = setInterval(loadUnreadCount, 30000);

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeConnection();
      clearInterval(unreadInterval);
    };
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadChatHistory(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getConversationDisplayName = (conv: ChatConversation) => {
    if (conv.role === 'admin' && !conv.first_name && !conv.last_name) {
      return 'Admin';
    }
    const fullName = `${conv.first_name || ''} ${conv.last_name || ''}`.trim();
    return fullName || conv.email;
  };

  const getConversationInitials = (conv: ChatConversation) => {
    if (conv.role === 'admin' && !conv.first_name && !conv.last_name) {
      return 'A';
    }
    const firstName = conv.first_name?.trim();
    const lastName = conv.last_name?.trim();
    
    if (firstName && lastName && firstName.length > 0 && lastName.length > 0) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName && firstName.length > 0) {
      return firstName[0].toUpperCase();
    } else if (lastName && lastName.length > 0) {
      return lastName[0].toUpperCase();
    }
    return conv.email?.[0]?.toUpperCase() || '?';
  };

  const getUserDisplayName = (user: User) => {
    if (user.role === 'admin' && (!user.first_name || user.first_name === '') && (!user.last_name || user.last_name === '')) {
      return 'Admin';
    }
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return fullName || user.email;
  };

  const getUserInitials = (user: User) => {
    if (user.role === 'admin' && (!user.first_name || user.first_name === '') && (!user.last_name || user.last_name === '')) {
      return 'A';
    }
    const firstName = user.first_name?.trim();
    const lastName = user.last_name?.trim();
    
    if (firstName && lastName && firstName.length > 0 && lastName.length > 0) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName && firstName.length > 0) {
      return firstName[0].toUpperCase();
    } else if (lastName && lastName.length > 0) {
      return lastName[0].toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || '?';
  };

  const loadUnreadCount = async () => {
    try {
      const data = await messagingApi.getUnreadCount();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const loadAllUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await messagingApi.getUsers();
      const filteredUsers = response.filter((u) => u.id !== currentUser.id);
      setAllUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleStartNewChat = (user: User) => {
    const userWithFullName = {
      ...user,
      full_name: getUserDisplayName(user),
    };
    setSelectedUser(userWithFullName);
    setIsNewChatOpen(false);
    setUserSearchQuery('');
    setMessages([]);
  };

  const loadConversations = async () => {
    try {
      const data = await messagingApi.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadChatHistory = async (userId: string) => {
    try {
      setIsLoading(true);
      const data = await messagingApi.getChatHistory(userId);
      console.log('Chat history loaded:', data);
      const sortedMessages = (data.messages || []).sort(
        (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
      );
      console.log('Sorted messages with attachments:', sortedMessages);
      setMessages(sortedMessages);
      
      const unreadMessages = sortedMessages.filter(
        (msg) => msg.sender_id === userId && msg.status !== 'read'
      );
      for (const msg of unreadMessages) {
        await messagingApi.markMessageAsRead(msg.id);
      }
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to load chat history:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = (message: ChatMessage) => {
    console.log('Received WebSocket message:', message);
    console.log('Message attachments:', message.attachments);
    console.log('Current user:', currentUser.id);
    console.log('Selected user:', selectedUser?.id);
    
    // Update messages if this chat is currently open
    if (
      selectedUser &&
      (message.sender_id === selectedUser.id || message.receiver_id === selectedUser.id)
    ) {
      setMessages((prev) => {
        const exists = prev.find((m) => m.id === message.id);
        if (exists) {
          return prev.map((m) => (m.id === message.id ? message : m));
        }
        return [...prev, message];
      });

      // Mark as read if it's from the selected user
      if (message.sender_id === selectedUser.id && message.receiver_id === currentUser.id) {
        messagingApi.markMessageAsRead(message.id).catch(console.error);
      }
    }

    loadUnreadCount();
  };

  const handleTyping = (typing: { user_id: string; is_typing: boolean }) => {
    setTypingUsers((prev) => {
      const newSet = new Set(prev);
      if (typing.is_typing) {
        newSet.add(typing.user_id);
      } else {
        newSet.delete(typing.user_id);
      }
      return newSet;
    });
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && attachments.length === 0) || !selectedUser) return;

    try {
      setIsSending(true);
      const sentMessage = await messagingApi.sendMessage(
        selectedUser.id, 
        messageInput.trim() || '📎 Attachment', 
        attachments.length > 0 ? attachments : undefined
      );
      setMessages((prev) => [...prev, sentMessage]);
      setMessageInput('');
      setAttachments([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (value: string) => {
    setMessageInput(value);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size is 10MB`);
        return false;
      }
      return true;
    });
    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const getAuthenticatedImageUrl = (attachmentId: string) => {
    const token = TokenStorage.getAccessToken();
    return `${import.meta.env.VITE_API_BASE_URL}/v1/messages/attachments/${attachmentId}?token=${token}`;
  };

  const handleAttachmentClick = async (attachmentId: string, fileName: string) => {
    try {
      const blob = await messagingApi.downloadAttachment(attachmentId);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error('Failed to download attachment:', error);
      toast.error('Failed to open attachment');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (date: string) => {
    // Parse ISO string directly without timezone conversion
    const parts = date.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (!parts) return date;
    
    const [, year, month, day, hour24, minute] = parts;
    let hours = parseInt(hour24, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    
    return `${day}-${month}-${year} ${hours}:${minute} ${ampm}`;
  };

  const getMessageStatusIcon = (message: ChatMessage) => {
    if (message.sender_id !== currentUser.id) return null;

    if (message.status === 'read') {
      return <CheckCheck className="w-3 h-3 text-blue-400" />;
    } else if (message.status === 'delivered') {
      return <CheckCheck className="w-3 h-3 text-gray-300" />;
    } else {
      return <Check className="w-3 h-3 text-gray-300" />;
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const displayName = getConversationDisplayName(conv);
    const searchLower = searchQuery.toLowerCase();
    return (
      displayName.toLowerCase().includes(searchLower) ||
      conv.email?.toLowerCase().includes(searchLower)
    );
  });

  const filteredUsers = allUsers.filter(
    (user) => {
      const displayName = getUserDisplayName(user);
      const searchLower = userSearchQuery.toLowerCase();
      return (
        displayName.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower)
      );
    }
  );

  return (
    <div className="flex gap-4" style={{ height: '75vh', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Left Sidebar - Conversations - Glassmorphism */}
      <div style={{ 
        width: '320px', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        overflow: 'hidden'
      }}>
        {/* Sidebar Header - Fixed */}
        <div style={{ 
          height: '120px', 
          padding: '16px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)', 
          background: 'rgba(255, 255, 255, 0.5)',
          flexShrink: 0 
        }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800">Messages</h2>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white text-xs h-5 px-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={loadAllUsers}
                    className="!bg-cyan-500 !text-white hover:!bg-cyan-600 h-8 w-8 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Start New Conversation</DialogTitle>
                    <DialogDescription>Select a user to start messaging</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <Input
                        placeholder="Search users..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="pl-10 h-9"
                      />
                    </div>
                    <div className="h-[400px] overflow-y-auto">
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center h-32">
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>No users found</p>
                        </div>
                      ) : (
                        <div className="space-y-2 p-2">
                          {filteredUsers.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => handleStartNewChat(user)}
                              className="w-full p-3 rounded-lg hover:bg-gray-100 transition-colors text-left border"
                            >
                              <div className="flex items-center gap-3">
                                <div style={{ width: '40px', height: '40px' }} className="rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                  <span className="text-white font-bold text-sm">
                                    {getUserInitials(user)}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm truncate">{getUserDisplayName(user)}</span>
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {user.role || 'user'}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-white"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div style={{ flex: 1, overflowY: 'auto', height: 'calc(75vh - 120px)' }}>
          {filteredConversations.map((conv) => {
            const displayName = getConversationDisplayName(conv);
            const initials = getConversationInitials(conv);
            
            return (
              <button
                key={conv.user_id}
                onClick={() => {
                  const user: User = {
                    id: conv.user_id,
                    email: conv.email,
                    role: conv.role,
                    first_name: conv.first_name,
                    last_name: conv.last_name,
                    full_name: displayName,
                  };
                  setSelectedUser(user);
                }}
                className={`w-full p-3 hover:bg-gray-50 transition-colors text-left border-b ${
                  selectedUser?.id === conv.user_id ? 'bg-white bg-opacity-50' : ''
                }`}
                style={{
                  background: selectedUser?.id === conv.user_id ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div style={{ width: '48px', height: '48px' }} className="rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {initials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm truncate">{displayName}</span>
                      {conv.last_message_at && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatMessageTime(conv.last_message_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-600 truncate flex-1" style={{ maxWidth: '220px' }}>
                        {conv.last_message || 'No messages yet'}
                      </p>
                      {conv.unread_count > 0 && (
                        <Badge className="bg-cyan-500 text-white text-xs h-5 px-2 flex-shrink-0">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Panel - Chat - Glassmorphism */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        overflow: 'hidden'
      }}>
        {selectedUser ? (
          <>
            {/* Chat Header - Fixed */}
            <div style={{ 
              height: '60px', 
              padding: '0 16px', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)', 
              background: 'rgba(255, 255, 255, 0.4)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              flexShrink: 0 
            }}>
              <div className="flex items-center gap-3">
                <div style={{ width: '40px', height: '40px' }} className="rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{selectedUser.full_name?.[0]?.toUpperCase() || selectedUser.email?.[0]?.toUpperCase() || '?'}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{selectedUser.full_name || selectedUser.email}</h3>
                  <p className="text-xs text-gray-500">
                    {typingUsers.has(selectedUser.id) ? (
                      <span className="text-cyan-600">typing...</span>
                    ) : (
                      selectedUser.email
                    )}
                  </p>
                </div>
              </div>
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-gray-200 rounded-full"
                  onClick={() => setShowChatMenu(!showChatMenu)}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
                {showChatMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowChatMenu(false)}
                    />
                    <div className="absolute right-0 top-10 w-40 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-50">
                      <button
                        onClick={() => {
                          setSelectedUser(null);
                          setMessages([]);
                          setShowChatMenu(false);
                          toast.success('Chat closed');
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-100 text-sm transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Close Chat
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-4" style={{ 
              flex: '1 1 0', 
              minHeight: 0,
              background: 'transparent'
            }}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {messages.map((message) => {
                    const isOwn = message.sender_id === currentUser.id;
                    return (
                      <div 
                        key={message.id} 
                        className="flex"
                        style={{ justifyContent: isOwn ? 'flex-end' : 'flex-start' }}
                      >
                        <div 
                          className={`rounded-lg px-3 py-2 shadow-sm ${
                            isOwn 
                              ? 'bg-cyan-500 text-white rounded-br-none' 
                              : 'bg-white text-gray-900 border rounded-bl-none'
                          }`}
                          style={{ 
                            maxWidth: '60%',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                            marginLeft: isOwn ? 'auto' : '0',
                            marginRight: isOwn ? '0' : 'auto'
                          }}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          
                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((attachment) => {
                                const isImage = attachment.mime_type.startsWith('image/');
                                const attachmentUrl = `${import.meta.env.VITE_API_BASE_URL}/v1/messages/attachments/${attachment.id}`;
                                return (
                                  <div key={attachment.id} className={`rounded p-2 ${
                                    isOwn ? 'bg-cyan-600' : 'bg-gray-100'
                                  }`}>
                                    {isImage ? (
                                      <div className="space-y-1">
                                        <img 
                                          src={getAuthenticatedImageUrl(attachment.id)}
                                          alt={attachment.file_name}
                                          className="max-w-full rounded cursor-pointer hover:opacity-90"
                                          style={{ maxHeight: '200px', objectFit: 'contain' }}
                                          onClick={() => handleAttachmentClick(attachment.id, attachment.file_name)}
                                          onError={(e) => {
                                            console.error('Image failed to load:', attachment.file_name, attachmentUrl);
                                          }}
                                        />
                                        <div className="flex items-center justify-between text-xs">
                                          <span className={isOwn ? 'text-cyan-100' : 'text-gray-600'}>{attachment.file_name}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleAttachmentClick(attachment.id, attachment.file_name)}
                                        className="flex items-center gap-2 hover:opacity-80 w-full text-left"
                                      >
                                        <FileText className="w-4 h-4" />
                                        <span className="text-xs flex-1 truncate">{attachment.file_name}</span>
                                        <Download className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className={`text-xs ${isOwn ? 'text-cyan-100' : 'text-gray-500'}`}>
                              {formatMessageTime(message.sent_at)}
                            </span>
                            {getMessageStatusIcon(message)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Attachments Preview - Fixed */}
            {attachments.length > 0 && (
              <div style={{ 
                height: 'auto', 
                padding: '8px 16px', 
                borderTop: '1px solid rgba(255, 255, 255, 0.2)', 
                background: 'rgba(255, 255, 255, 0.4)',
                flexShrink: 0 
              }}>
                <div className="flex gap-2 flex-wrap">
                  {attachments.map((file, idx) => {
                    const isImage = file.type.startsWith('image/');
                    const previewUrl = isImage ? URL.createObjectURL(file) : null;
                    
                    return (
                      <div key={idx} className="relative bg-white border rounded p-2">
                        <button 
                          onClick={() => removeAttachment(idx)} 
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {isImage && previewUrl ? (
                          <div className="flex flex-col gap-1">
                            <img 
                              src={previewUrl} 
                              alt={file.name} 
                              className="w-20 h-20 object-cover rounded"
                              onLoad={() => URL.revokeObjectURL(previewUrl)}
                            />
                            <span className="text-xs text-gray-600 max-w-[80px] truncate">{file.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-2 py-1">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-xs max-w-[120px] truncate">{file.name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input Area - Fixed at Bottom */}
            <div style={{ 
              height: '60px', 
              padding: '0 16px', 
              borderTop: '1px solid rgba(255, 255, 255, 0.2)', 
              background: 'rgba(255, 255, 255, 0.4)',
              display: 'flex', 
              alignItems: 'center', 
              flexShrink: 0 
            }}>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 h-10 w-10 p-0"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 h-10"
                  disabled={!isConnected}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={(!messageInput.trim() && attachments.length === 0) || isSending || !isConnected}
                  className="!bg-cyan-500 !text-white hover:!bg-cyan-600 flex-shrink-0 h-10 w-10 p-0"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Send className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
