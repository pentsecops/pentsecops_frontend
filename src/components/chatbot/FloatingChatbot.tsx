import { useState } from 'react';
import { Bot } from 'lucide-react';
import { useChatbot } from '../../contexts/ChatbotContext';
import { ChatPanel } from './ChatPanel';

export function FloatingChatbot() {
  const { toggleChat } = useChatbot();
  const [isHovered, setIsHovered] = useState(false);

  console.log('FloatingChatbot is rendering');

  return (
    <>
      <ChatPanel />
      
      {/* Floating AI Chat Button - ALWAYS VISIBLE */}
      <div
        onClick={toggleChat}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb 0%, #9333ea 50%, #4f46e5 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 999999,
          transition: 'transform 0.3s ease',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Bot style={{ width: '32px', height: '32px', color: 'white', strokeWidth: 2.5 }} />
        
        {/* Tooltip */}
        {isHovered && (
          <div style={{
            position: 'absolute',
            right: '80px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#1f2937',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            whiteSpace: 'nowrap',
            zIndex: 999999,
          }}>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>PentSecOps AI Chat</div>
            <div style={{ fontSize: '12px', color: '#d1d5db', marginTop: '2px' }}>Click to start chatting</div>
          </div>
        )}
      </div>
    </>
  );
}
