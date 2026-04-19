import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Bell, Send, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { adminApiService } from '../../services/adminApi';

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    send_to: 'all_pentesters',
    user_id: '',
    type: 'info',
    priority: 'medium'
  });
  const [notificationPage, setNotificationPage] = useState(1);
  const [alertPage, setAlertPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [notificationsRes, usersRes, alertsRes] = await Promise.all([
        adminApiService.getNotifications().catch(() => ({ success: false })),
        adminApiService.getUsers().catch(() => ({ success: false })),
        adminApiService.getAlerts().catch(() => ({ success: false }))
      ]);

      if (notificationsRes.success) {
        setNotifications(notificationsRes.data?.notifications || []);
      }

      if (usersRes.success) {
        setUsers(usersRes.data?.users || []);
      }

      if (alertsRes.success) {
        setAlerts(alertsRes.data?.alerts || []);
      }
    } catch (error) {
      console.error('Error loading notifications data:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newNotification.send_to === 'specific_user' && !newNotification.user_id) {
      toast.error('Please select a specific user');
      return;
    }

    try {
      // Map frontend values to backend expected values
      const sentToMapping = {
        'all_pentesters': 'all_pentesters',
        'all_stakeholders': 'all_stakeholders',
        'specific_user': 'specific_user'
      };

      const notificationData = {
        title: newNotification.title.trim(),
        message: newNotification.message.trim(),
        send_to: sentToMapping[newNotification.send_to] || 'all_pentesters',
        type: newNotification.type || 'info',
        priority: newNotification.priority || 'medium'
      };

      // Add user_id only for specific_user
      if (newNotification.send_to === 'specific_user' && newNotification.user_id) {
        notificationData.user_id = newNotification.user_id;
      }

      console.log('Raw form data:', newNotification);
      console.log('Final notification data being sent:', JSON.stringify(notificationData, null, 2));


      const response = await adminApiService.sendNotification(notificationData);
      console.log('Notification response:', response);

      if (response.success) {
        toast.success('Notification sent successfully');
        loadData();
        setNewNotification({ title: '', message: '', send_to: 'all_pentesters', user_id: '', type: 'info', priority: 'medium' });
      } else {
        console.error('Notification error details:', response.error);
        toast.error(response.error?.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const response = await adminApiService.deleteNotification(id);
      if (response.success) {
        toast.success('Notification deleted');
        loadData();
      } else {
        toast.error('Failed to delete notification');
      }
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Read': return 'outline';
      case 'Delivered': return 'secondary';
      case 'Sent': return 'default';
      default: return 'secondary';
    }
  };

  const paginatedAlerts = alerts.slice(
    (alertPage - 1) * itemsPerPage,
    alertPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div>
        <h2>Notifications & Alerts</h2>
        <p className="text-muted-foreground">Send alerts to pentesters and stakeholders</p>
      </div>

      {/* Create Notification */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Notification</CardTitle>
          <CardDescription>Send targeted alerts to users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              value={newNotification.title}
              onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
              placeholder="Important: System Maintenance Scheduled"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={newNotification.message}
              onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
              placeholder="Enter your notification message here..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="send_to">Send To</Label>
              <Select
                value={newNotification.send_to}
                onValueChange={(value: any) => setNewNotification({ ...newNotification, send_to: value, user_id: '' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_pentesters">All Pentesters</SelectItem>
                  <SelectItem value="all_stakeholders">All Stakeholders</SelectItem>
                  <SelectItem value="specific_user">Specific User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={newNotification.type}
                onValueChange={(value: any) => setNewNotification({ ...newNotification, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newNotification.priority}
                onValueChange={(value: any) => setNewNotification({ ...newNotification, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newNotification.send_to === 'specific_user' && (
              <div className="space-y-2">
                <Label htmlFor="user_id">Select User</Label>
                <Select
                  value={newNotification.user_id}
                  onValueChange={(value) => setNewNotification({ ...newNotification, user_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button onClick={handleSendNotification} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Send Notification
          </Button>
        </CardContent>
      </Card>

      {/* Notification Stats */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{notifications.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Notifications</CardTitle>
          <CardDescription>History of all notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.slice(
              (notificationPage - 1) * itemsPerPage,
              notificationPage * itemsPerPage
            ).map((notification) => (
              <div key={notification.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <Bell className="w-5 h-5 text-muted-foreground mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4>{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => toast.info('View details')}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteNotification(notification.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline">{notification.send_to?.replace('_', ' ')}</Badge>
                    <Badge variant={notification.type === 'error' ? 'destructive' : 'secondary'}>{notification.type}</Badge>
                    <Badge variant={notification.priority === 'high' ? 'destructive' : 'outline'}>{notification.priority}</Badge>
                    <span className="text-muted-foreground">{new Date(notification.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {((notificationPage - 1) * itemsPerPage) + 1} to {Math.min(notificationPage * itemsPerPage, notifications.length)} of {notifications.length} notifications
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotificationPage(Math.max(1, notificationPage - 1))}
                disabled={notificationPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">{notificationPage} of {Math.ceil(notifications.length / itemsPerPage)}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotificationPage(Math.min(Math.ceil(notifications.length / itemsPerPage), notificationPage + 1))}
                disabled={notificationPage === Math.ceil(notifications.length / itemsPerPage)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Received from Pentesters */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts from Pentesters</CardTitle>
          <CardDescription>Important notifications from pentesters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedAlerts.length > 0 ? (
              paginatedAlerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${alert.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4>{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">From: {alert.from}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{alert.date}</span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No alerts available
              </div>
            )}
          </div>
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {((alertPage - 1) * itemsPerPage) + 1} to {Math.min(alertPage * itemsPerPage, alerts.length)} of {alerts.length} alerts
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAlertPage(Math.max(1, alertPage - 1))}
                disabled={alertPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">{alertPage} of {Math.ceil(alerts.length / itemsPerPage)}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAlertPage(Math.min(Math.ceil(alerts.length / itemsPerPage), alertPage + 1))}
                disabled={alertPage === Math.ceil(alerts.length / itemsPerPage)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
