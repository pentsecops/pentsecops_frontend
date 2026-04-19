import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Shield, LogOut, Eye, Settings, User, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { StakeholderOverview } from './stakeholder/StakeholderOverview';
import { StakeholderProjects } from './stakeholder/StakeholderProjects';
import { StakeholderTaskBoard } from './stakeholder/StakeholderTaskBoard';
import { VulnerabilityMonitoring } from './stakeholder/VulnerabilityMonitoring';
import { StakeholderSettings } from './stakeholder/StakeholderSettings';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { useAuth } from '../contexts/AuthContext';
import { ChatbotProvider } from '../contexts/ChatbotContext';
import { FloatingChatbot } from './chatbot/FloatingChatbot';
import { MessagingDashboard } from './messaging/MessagingDashboard';

export function StakeholderDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/log-in');
    } catch (error) {
      toast.error('Logout failed');
    }
  };
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <ChatbotProvider>
      <div className="min-h-screen bg-background relative">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-background to-emerald-50/30 dark:from-green-950/10 dark:via-background dark:to-emerald-950/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(34,197,94,0.05),transparent_50%)]" />

        {/* Header */}
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm relative">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  className="relative"
                >
                  <Shield className="w-8 h-8 text-green-600" />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Eye className="w-3 h-3 text-blue-500" />
                  </motion.div>
                </motion.div>
                <div>
                  <h2 className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold text-lg">
                    PentSecOps Stakeholder
                  </h2>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div>
                      <Button variant="outline" className="group">
                        <Settings className="w-4 h-4 mr-2" />
                        Account
                      </Button>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <ChangePasswordDialog
                      trigger={
                        <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                          <Lock className="w-4 h-4 mr-2" />
                          Change Password
                        </DropdownMenuItem>
                      }
                    />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 relative">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <TabsList className="mb-8 bg-card/50 backdrop-blur-sm p-1 shadow-lg">
                {['overview', 'projects', 'tasks', 'vulnerabilities', 'messages', 'settings'].map((tab, index) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="capitalize"
                  >
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {tab}
                    </motion.span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </motion.div>

            {['overview', 'projects', 'tasks', 'vulnerabilities', 'messages', 'settings'].map((tab) => (
              <TabsContent key={tab} value={tab}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {tab === 'overview' && <StakeholderOverview />}
                  {tab === 'projects' && <StakeholderProjects />}
                  {tab === 'tasks' && <StakeholderTaskBoard />}
                  {tab === 'vulnerabilities' && <VulnerabilityMonitoring />}
                  {tab === 'messages' && <MessagingDashboard />}
                  {tab === 'settings' && <StakeholderSettings />}
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
      <FloatingChatbot />
    </ChatbotProvider>
  );
}
