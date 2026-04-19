import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  AlertCircle,
  AlertTriangle,
  Info,
  Zap,
  Trash2,
  Loader2,
  Mail,
  MessageSquare,
  Plus,
  Users,
  User,
  Radio,
} from 'lucide-react';
import { toast } from 'sonner';
import { websocketService, Notification } from '../../services/websocketService';
import { messagingApi, User as UserType } from '../../services/messagingApi';

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [userMap, setUserMap] = useState<Map<string, UserType>>(new Map());
  const [formData, setFormData] = useState({
    receiver_type: 'single' as 'single' | 'multiple' | 'broadcast',
    receiver_ids: [] as string[],
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    in_app: true,
    email: false,
  });

  useEffect(() => {
    loadNotifications();
    loadAllUsersForMapping();
    websocketService.connect();

    const unsubscribe = websocketService.onNotification(handleNewNotification);

    return () => {
      unsubscribe();
    };
  }, []);

  const loadAllUsersForMapping = async () => {
    try {
      const data = await messagingApi.getUsers();
      const map = new Map<string, UserType>();
      data.forEach((user) => {
        map.set(user.id, user);
      });
      setUserMap(map);
    } catch (error) {
      console.error('Failed to load users for mapping:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await messagingApi.getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await messagingApi.getUsers();
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const filteredUsers = data.filter((u) => u.id !== currentUser.id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleCreateNotification = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Subject and message are required');
      return;
    }

    if (formData.receiver_type !== 'broadcast' && formData.receiver_ids.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    try {
      setIsCreating(true);
      await messagingApi.createNotification(formData);
      toast.success('Notification sent successfully');
      setIsCreateDialogOpen(false);
      setFormData({
        receiver_type: 'single',
        receiver_ids: [],
        subject: '',
        message: '',
        priority: 'medium',
        in_app: true,
        email: false,
      });
      loadNotifications();
    } catch (error) {
      console.error('Failed to create notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setIsCreating(false);
    }
  };

  const handleNewNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    
    toast.custom((t) => (
      <div className="bg-white border rounded-lg shadow-lg p-4 max-w-md">
        <div className="flex items-start gap-3">
          {getPriorityIcon(notification.priority)}
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{notification.subject}</h4>
            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
          </div>
        </div>
      </div>
    ), {
      duration: 5000,
    });
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await messagingApi.markNotificationAsRead(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    const p = priority.toLowerCase();
    switch (p) {
      case 'critical':
        return <Zap className="w-5 h-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    const p = priority.toLowerCase();
    switch (p) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSenderName = (senderId: string) => {
    const user = userMap.get(senderId);
    if (!user) return 'Unknown';
    if (user.role === 'admin' && !user.first_name && !user.last_name) {
      return 'Admin';
    }
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return fullName || user.email;
  };

  const formatTime = (date: string) => {
    const notifDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;
    return notifDate.toLocaleDateString();
  };

  const filteredNotifications = notifications;

  return (
    <Card className="h-[calc(100vh-200px)] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <CardTitle className="text-lg">Notifications</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={loadUsers} className="!bg-cyan-500 !text-white hover:!bg-cyan-600">
                  <Plus className="w-4 h-4 mr-1" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl">
                <DialogHeader>
                  <DialogTitle>Create Notification</DialogTitle>
                  <DialogDescription>Send notifications to users via in-app or email</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Receiver Type</Label>
                      <Select
                        value={formData.receiver_type}
                        onValueChange={(v) => setFormData({ ...formData, receiver_type: v as any, receiver_ids: [] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Single User
                            </div>
                          </SelectItem>
                          <SelectItem value="multiple">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Multiple Users
                            </div>
                          </SelectItem>
                          <SelectItem value="broadcast">
                            <div className="flex items-center gap-2">
                              <Radio className="w-4 h-4" />
                              Broadcast (All Users)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input
                        placeholder="Enter notification subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        placeholder="Enter notification message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(v) => setFormData({ ...formData, priority: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Delivery Method</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.in_app}
                            onChange={(e) => setFormData({ ...formData, in_app: e.target.checked })}
                            className="rounded"
                          />
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">In-App</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.checked })}
                            className="rounded"
                          />
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">Email</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {formData.receiver_type !== 'broadcast' ? (
                      <>
                        <Label>Select Recipients</Label>
                        <div className="border rounded-lg p-3 h-[400px] overflow-y-auto space-y-2">
                          {users.map((user) => (
                            <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={formData.receiver_ids.includes(user.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      receiver_ids: formData.receiver_type === 'single' ? [user.id] : [...formData.receiver_ids, user.id],
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      receiver_ids: formData.receiver_ids.filter((id) => id !== user.id),
                                    });
                                  }
                                }}
                                className="rounded"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium">
                                  {user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : user.email}
                                </div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                              <Badge variant="outline" className="text-xs">{user.role}</Badge>
                            </label>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="border rounded-lg p-8 h-[400px] flex items-center justify-center text-center">
                        <div>
                          <Radio className="w-12 h-12 mx-auto mb-3 text-cyan-500" />
                          <h3 className="font-semibold mb-2">Broadcast Mode</h3>
                          <p className="text-sm text-gray-500">This notification will be sent to all users</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateNotification}
                    disabled={isCreating}
                    className="!bg-cyan-500 !text-white hover:!bg-cyan-600"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Notification'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <div className="px-4 pt-3">
      </div>

      <ScrollArea className="flex-1 px-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <BellOff className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2 py-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 rounded-lg border bg-white border-gray-200 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getPriorityIcon(notification.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-gray-900">
                        {notification.subject}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getPriorityColor(notification.priority)}`}
                      >
                        {notification.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500">Sent by:</span>
                      <span className="text-xs font-medium text-gray-700">{getSenderName(notification.sender_id)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatTime(notification.created_at)}</span>
                        {notification.in_app && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>In-app</span>
                          </div>
                        )}
                        {notification.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>Email</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
