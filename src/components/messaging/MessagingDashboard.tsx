import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MessageSquare, Bell } from 'lucide-react';
import { MessagingPanel } from './MessagingPanel';
import { NotificationsCenter } from './NotificationsCenter';

export function MessagingDashboard() {
  const [activeTab, setActiveTab] = useState('messages');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Communication Center</h1>
        <p className="text-muted-foreground">Stay connected with your team</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-4">
          <MessagingPanel />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <NotificationsCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
