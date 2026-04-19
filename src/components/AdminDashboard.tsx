import { useState, Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Shield, LogOut, Sparkles, Settings, AlertTriangle, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { AdminOverview } from './admin/AdminOverview';
import { UserManagement } from './admin/UserManagement';
import { ProjectManagement } from './admin/ProjectManagement';
import { VulnerabilityMonitoring } from './stakeholder/VulnerabilityMonitoring';
import { ReportManagement } from './admin/ReportManagement';
import { NotificationsPanel } from './admin/NotificationsPanel';
import { PasswordRequests } from './admin/PasswordRequests';
import { AdminTaskBoard } from './admin/AdminTaskBoard';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { useAuth } from '../contexts/AuthContext';
import { ChatbotProvider } from '../contexts/ChatbotContext';
import { FloatingChatbot } from './chatbot/FloatingChatbot';
import { MessagingDashboard } from './messaging/MessagingDashboard';

class ErrorBoundary extends Component<{ children: ReactNode, fallback?: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode, fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg flex items-center gap-3 text-red-800">
          <AlertTriangle className="w-5 h-5" />
          <div className="flex-1">
            <h4 className="font-semibold">Something went wrong</h4>
            <p className="text-sm">{this.state.error?.message}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => this.setState({ hasError: false })}>
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function AdminDashboard() {
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-background to-indigo-50/30 dark:from-blue-950/10 dark:via-background dark:to-indigo-950/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.05),transparent_50%)]" />

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
                <Shield className="w-8 h-8 text-blue-600" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                </motion.div>
              </motion.div>
              <div>
                <h2 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold text-xl">
                  PentSecOps Admin
                </h2>
                <p className="text-muted-foreground">Welcome, {user?.name}</p>
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
                  <ChangePasswordDialog
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
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
            <TabsList className="mb-8 bg-card/50 backdrop-blur-sm p-1 shadow-lg overflow-x-auto flex-nowrap max-w-full justify-start md:justify-center">
              {['overview', 'users', 'projects', 'tasks', 'vulnerabilities', 'messages', 'password-requests'].map((tab, index) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="capitalize whitespace-nowrap"
                >
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {tab === 'password-requests' ? 'Password Requests' : tab}
                  </motion.span>
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          {/* Tab Contents Wrapped in ErrorBoundary */}

          <TabsContent value="overview">
            <ErrorBoundary>
              <AdminOverview onTabChange={setActiveTab} />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="users">
            <ErrorBoundary>
              <UserManagement />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="projects">
            <ErrorBoundary>
              <ProjectManagement />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="tasks">
            <ErrorBoundary>
              <AdminTaskBoard />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="vulnerabilities">
            <ErrorBoundary>
              <VulnerabilityMonitoring />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="messages">
            <ErrorBoundary>
              <MessagingDashboard />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="password-requests">
            <ErrorBoundary>
              <PasswordRequests />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* AI Chatbot - Outside main container */}
      <FloatingChatbot />
    </div>
  </ChatbotProvider>
  );
}
