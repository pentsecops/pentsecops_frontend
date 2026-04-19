import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Send, Loader2, Paperclip, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useChatbot } from '../../contexts/ChatbotContext';
import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../services/axiosConfig';
import { TokenStorage } from '../../services/tokenStorage';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const formatMessageContent = (content: string) => {
  return content.split('\n').map((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return <br key={index} />;
    
    // Check for numbered list items (e.g., "1.", "2.", etc.)
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      return (
        <div key={index} className="flex gap-2 mb-2">
          <span className="font-semibold">{numberedMatch[1]}.</span>
          <span>{numberedMatch[2]}</span>
        </div>
      );
    }
    
    return <p key={index} className="mb-2">{trimmedLine}</p>;
  });
};

export function ChatPanel() {
  const { isChatOpen, closeChat, contextText, setContextText } = useChatbot();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      loadChatHistory();
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (contextText) {
      setInput(`Explain: "${contextText}"`);
      setContextText(null);
    }
  }, [contextText, setContextText]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.get(`${API_BASE_URL}/v1/chats/history?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.data) {
        const history = response.data.data.map((item: any) => ([
          {
            id: `${item.id}-user`,
            role: 'user' as const,
            content: item.query,
            timestamp: new Date(item.created_at),
          },
          {
            id: `${item.id}-assistant`,
            role: 'assistant' as const,
            content: item.response,
            timestamp: new Date(item.created_at),
          },
        ])).flat();
        setMessages(history);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input + (attachedFiles.length > 0 ? ` [${attachedFiles.length} file(s) attached]` : ''),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = input;
    const files = attachedFiles;
    setInput('');
    setAttachedFiles([]);
    setIsSending(true);

    try {
      const token = TokenStorage.getAccessToken();
      const formData = new FormData();
      formData.append('query', query);
      files.forEach((file) => {
        formData.append('documents', file);
      });

      const response = await axiosInstance.post(
        `${API_BASE_URL}/v1/chats`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      if (response.data.success && response.data.messages && Array.isArray(response.data.messages)) {
        const lastAssistantMessage = response.data.messages
          .reverse()
          .find((msg: any) => msg.role === 'assistant');
        
        if (lastAssistantMessage) {
          const botMessage: Message = {
            id: lastAssistantMessage.id,
            role: 'assistant',
            content: lastAssistantMessage.content,
            timestamp: new Date(lastAssistantMessage.created_at),
          };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          throw new Error('No assistant message in response');
        }
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error('Failed to get AI response');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isChatOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-[9997]"
            onClick={closeChat}
          />

          {/* Chat Panel - Fixed 400px sidebar */}
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: '400px',
              height: '100vh',
              zIndex: 9998,
              display: 'flex',
              flexDirection: 'column',
            }}
            className="bg-white dark:bg-gray-900 shadow-2xl border-r-2 border-purple-500"
          >
            {/* Header - Fixed height */}
            <div style={{ flexShrink: 0 }} className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">PentSecOps AI</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Personalised AI Chat</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={closeChat}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages Area - Scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
              <div className="p-4 space-y-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                    <p className="text-sm text-gray-500">Loading chat history...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center opacity-50">
                    <Bot className="w-16 h-16 mb-4 text-gray-400" strokeWidth={2} />
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      Hello! I'm PentSecOps AI
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Ask me anything about security testing
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="flex gap-3 flex-row mb-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                            : 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <span className="text-white text-sm font-semibold">U</span>
                        ) : (
                          <Bot className="w-4 h-4 text-white" strokeWidth={2.5} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, maxWidth: '300px' }}>
                        <div
                          className={`rounded-2xl px-4 py-3 break-words ${
                            message.role === 'user'
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <div className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {message.role === 'assistant' ? formatMessageContent(message.content) : message.content}
                          </div>
                          <span className="text-[10px] mt-1 block opacity-50">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={scrollEndRef} style={{ height: '1px' }} />
              </div>
            </div>

            {/* Input Area - Fixed height */}
            <div style={{ flexShrink: 0 }} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              {attachedFiles.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-xs">
                      <FileText className="w-3 h-3" />
                      <span className="max-w-[150px] truncate">{file.name}</span>
                      <button onClick={() => removeFile(index)} className="ml-1 hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="icon"
                  variant="outline"
                  className="flex-shrink-0"
                  disabled={isSending}
                  title="Attach files"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isSending}
                />
                <Button 
                  onClick={handleSend} 
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                  style={{ backgroundColor: '#2563eb', color: 'white' }}
                  disabled={isSending || (!input.trim() && attachedFiles.length === 0)}
                  title="Send message"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
