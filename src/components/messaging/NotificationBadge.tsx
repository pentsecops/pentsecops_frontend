import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { websocketService } from '../../services/websocketService';
import { messagingApi } from '../../services/messagingApi';

interface NotificationBadgeProps {
  onClick?: () => void;
}

export function NotificationBadge({ onClick }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    loadUnreadCount();
    websocketService.connect();

    const unsubscribeNotification = websocketService.onNotification(() => {
      loadUnreadCount();
      triggerAnimation();
    });

    const unsubscribeMessage = websocketService.onMessage(() => {
      loadUnreadCount();
      triggerAnimation();
    });

    return () => {
      unsubscribeNotification();
      unsubscribeMessage();
    };
  }, []);

  const loadUnreadCount = async () => {
    try {
      const counts = await messagingApi.getUnreadCounts();
      setUnreadCount(counts.messages + counts.notifications);
    } catch (error) {
      console.error('Failed to load unread counts:', error);
    }
  };

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="relative"
    >
      <Bell className={`w-5 h-5 ${isAnimating ? 'animate-bounce' : ''}`} />
      {unreadCount > 0 && (
        <Badge
          className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center bg-red-500 text-white text-xs px-1 animate-pulse"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
