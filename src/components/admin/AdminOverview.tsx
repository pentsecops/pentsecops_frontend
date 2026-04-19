import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Users, Shield, Folder, AlertTriangle, MessageSquare, ListTodo, UserPlus, TrendingUp, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axiosInstance from '../../services/axiosConfig';
import { TokenStorage } from '../../services/tokenStorage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ActivityItem {
  id: string;
  user_id: string;
  email?: string;
  activity_type: string;
  description: string;
  metadata?: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface AdminOverviewProps {
  onTabChange?: (tab: string) => void;
}

export function AdminOverview({ onTabChange }: AdminOverviewProps) {
  const [totalProjects, setTotalProjects] = useState(0);
  const [activePentesters, setActivePentesters] = useState(0);
  const [activeStakeholders, setActiveStakeholders] = useState(0);
  const [criticalIssues, setCriticalIssues] = useState(0);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [vulnerabilityTrend, setVulnerabilityTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activities.length > 0) {
      const interval = setInterval(() => {
        setCurrentActivityIndex((prev) => (prev + 1) % activities.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activities]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = TokenStorage.getAccessToken();

      // Fetch all data in parallel
      const [projectsRes, usersRes, activitiesRes] = await Promise.all([
        axiosInstance.get(`${API_BASE_URL}/v1/admin/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get(`${API_BASE_URL}/v1/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get(`${API_BASE_URL}/v1/activities`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Set projects count
      if (projectsRes.data.success) {
        const projects = projectsRes.data.data || [];
        setTotalProjects(projects.length);
        
        // Fetch vulnerabilities for all projects
        let allVulnerabilities: any[] = [];
        
        for (const project of projects) {
          try {
            const vulnRes = await axiosInstance.get(
              `${API_BASE_URL}/v1/projects/${project.id}/vulnerabilities`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (vulnRes.data.success && vulnRes.data.data) {
              allVulnerabilities.push(...vulnRes.data.data);
            }
          } catch (error) {
            console.error(`Error fetching vulnerabilities for project ${project.id}:`, error);
          }
        }

        // Count critical issues
        const critical = allVulnerabilities.filter(v => v.severity === 'critical').length;
        setCriticalIssues(critical);

        // Generate vulnerability trend data (last 4 months)
        const trendData = generateVulnerabilityTrend(allVulnerabilities);
        setVulnerabilityTrend(trendData);
      }

      // Set users count - FIX: Role is in user.role
      if (usersRes.data.success) {
        const usersData = usersRes.data.data;
        const users = usersData?.users || [];
        
        if (Array.isArray(users) && users.length > 0) {
          const pentesters = users.filter((u: any) => u.user?.role === 'pentester');
          const stakeholders = users.filter((u: any) => u.user?.role === 'stakeholder');
          setActivePentesters(pentesters.length);
          setActiveStakeholders(stakeholders.length);
        }
      }

      // Set activities
      if (activitiesRes.data.activities) {
        setActivities(activitiesRes.data.activities);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateVulnerabilityTrend = (vulnerabilities: any[]) => {
    const months = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthVulns = vulnerabilities.filter(v => {
        const vulnDate = new Date(v.created_at);
        return vulnDate.getMonth() === date.getMonth() && 
               vulnDate.getFullYear() === date.getFullYear();
      });

      months.push({
        month: monthName,
        critical: monthVulns.filter(v => v.severity === 'critical').length,
        high: monthVulns.filter(v => v.severity === 'high').length,
        medium: monthVulns.filter(v => v.severity === 'medium').length,
        low: monthVulns.filter(v => v.severity === 'low').length,
        total: monthVulns.length
      });
    }
    
    return months;
  };

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getActivityIcon = (type: string) => {
    if (type.includes('login')) return '🔐';
    if (type.includes('task')) return '📋';
    if (type.includes('vulnerability')) return '🔴';
    if (type.includes('project')) return '📁';
    return '📌';
  };

  const statCards = [
    {
      title: 'Total Projects',
      value: totalProjects,
      subtitle: 'All projects',
      icon: Folder,
      color: 'text-blue-600',
      gradient: 'from-blue-500/10 to-blue-500/5',
    },
    {
      title: 'Active Pentesters',
      value: activePentesters,
      subtitle: 'Security testers',
      icon: Users,
      color: 'text-purple-600',
      gradient: 'from-purple-500/10 to-purple-500/5',
    },
    {
      title: 'Active Stakeholders',
      value: activeStakeholders,
      subtitle: 'Project owners',
      icon: Shield,
      color: 'text-green-600',
      gradient: 'from-green-500/10 to-green-500/5',
    },
    {
      title: 'Critical Issues',
      value: criticalIssues,
      subtitle: 'Immediate attention',
      icon: AlertTriangle,
      color: 'text-red-600',
      gradient: 'from-red-500/10 to-red-500/5',
    },
  ];

  const visibleActivities = activities.slice(currentActivityIndex, currentActivityIndex + 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <Card className={`bg-gradient-to-br ${card.gradient} backdrop-blur-sm border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer h-full`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">{card.title}</CardTitle>
                <motion.div whileHover={{ scale: 1.2, rotate: 5 }}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </motion.div>
              </CardHeader>
              <CardContent>
                <motion.div
                  className="text-2xl font-bold"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                >
                  {loading ? '...' : card.value}
                </motion.div>
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Vulnerability Trend - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Vulnerability Trend</CardTitle>
            <CardDescription>Monthly vulnerability discoveries by severity</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading chart...</p>
              </div>
            ) : vulnerabilityTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={vulnerabilityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="critical" stroke="#ef4444" name="Critical" strokeWidth={2} />
                  <Line type="monotone" dataKey="high" stroke="#f97316" name="High" strokeWidth={2} />
                  <Line type="monotone" dataKey="medium" stroke="#eab308" name="Medium" strokeWidth={2} />
                  <Line type="monotone" dataKey="low" stroke="#3b82f6" name="Low" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity - Left Side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 h-[300px] overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Loading activities...</p>
                  </div>
                ) : activities.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    {visibleActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-xl flex-shrink-0">{getActivityIcon(activity.activity_type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 truncate">{activity.email || 'System'}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{formatActivityTime(activity.created_at)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No recent activities
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions - Right Side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline"
                className="w-full justify-start text-black hover:bg-gray-50"
                onClick={() => onTabChange?.('users')}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create New User
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-black hover:bg-gray-50" 
                onClick={() => onTabChange?.('messages')}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-black hover:bg-gray-50" 
                onClick={() => onTabChange?.('vulnerabilities')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Vulnerabilities
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-black hover:bg-gray-50" 
                onClick={() => onTabChange?.('tasks')}
              >
                <ListTodo className="w-4 h-4 mr-2" />
                Tasks
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
