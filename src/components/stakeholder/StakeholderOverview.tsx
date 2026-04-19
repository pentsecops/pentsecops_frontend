import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Shield, AlertTriangle, Activity, Loader2, User } from 'lucide-react';
import { projectApi } from '../../services/projectApi';
import { profileApi } from '../../services/profileApi';
import axiosInstance from '../../services/axiosConfig';
import { TokenStorage } from '../../services/tokenStorage';
import { motion } from 'motion/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Vulnerability {
  id: string;
  project_id: string;
  task_id: string;
  reported_by: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cvss_score: number;
  cwe_id: string;
  owasp_category: string;
  affected_asset: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  remediation: string;
  evidence: string;
  created_at: string;
  updated_at: string;
}

export function StakeholderOverview() {
  const [profileData, setProfileData] = useState<any>(null);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [criticalIssuesCount, setCriticalIssuesCount] = useState(0);
  const [totalVulnerabilities, setTotalVulnerabilities] = useState(0);
  const [openVulnerabilities, setOpenVulnerabilities] = useState(0);
  const [remediationRate, setRemediationRate] = useState(0);
  const [vulnerabilityTrend, setVulnerabilityTrend] = useState<any[]>([]);
  const [recentVulnerabilities, setRecentVulnerabilities] = useState<Vulnerability[]>([]);
  const [userNames, setUserNames] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Fetch profile data
      const profile = await profileApi.getProfile();
      setProfileData(profile);

      // Fetch user projects count
      const userProjects = await projectApi.getUserProjects();
      setActiveProjectsCount(userProjects.length);

      // Fetch users for name mapping
      const token = TokenStorage.getAccessToken();
      const usersResponse = await axiosInstance.get(
        `${API_BASE_URL}/v1/messages/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (usersResponse.data.success) {
        const users = usersResponse.data.data || [];
        const namesMap = new Map<string, string>();
        users.forEach((user: any) => {
          namesMap.set(user.id, `${user.first_name} ${user.last_name}`);
        });
        setUserNames(namesMap);
      }

      // Fetch vulnerabilities from all projects
      const allVulnerabilities: Vulnerability[] = [];
      for (const userProject of userProjects) {
        try {
          const response = await axiosInstance.get(
            `${API_BASE_URL}/v1/projects/${userProject.project_id}/vulnerabilities`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.data.success && response.data.data) {
            allVulnerabilities.push(...response.data.data);
          }
        } catch (error) {
          console.error(`Error fetching vulnerabilities for project ${userProject.project_id}:`, error);
        }
      }

      // Calculate metrics
      const critical = allVulnerabilities.filter(v => v.severity === 'critical').length;
      const open = allVulnerabilities.filter(v => v.status === 'new' || v.status === 'in_progress').length;
      const resolved = allVulnerabilities.filter(v => v.status === 'resolved' || v.status === 'closed').length;
      const total = allVulnerabilities.length;
      const rate = total > 0 ? (resolved / total * 100) : 0;

      setCriticalIssuesCount(critical);
      setTotalVulnerabilities(total);
      setOpenVulnerabilities(open);
      setRemediationRate(rate);

      // Sort by created_at and get recent 5
      const recent = [...allVulnerabilities]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentVulnerabilities(recent);

      // Generate vulnerability trend data for last 4 months
      const trendData = generateTrendData(allVulnerabilities);
      setVulnerabilityTrend(trendData);

    } catch (error) {
      console.error('Error loading stakeholder overview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTrendData = (vulnerabilities: Vulnerability[]) => {
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

  const getUserName = (userId: string) => {
    return userNames.get(userId) || 'Unknown User';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold">Welcome, {profileData?.profile?.first_name} {profileData?.profile?.last_name}</h2>
        <p className="text-muted-foreground">Overall security posture and trends</p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            title: 'Active Projects', 
            value: activeProjectsCount.toString(), 
            subtitle: 'Assigned to you', 
            icon: Activity, 
            color: 'text-blue-600', 
            gradient: 'from-blue-500/10 to-blue-500/5' 
          },
          { 
            title: 'Critical Issues', 
            value: criticalIssuesCount.toString(), 
            subtitle: 'Immediate attention', 
            icon: AlertTriangle, 
            color: 'text-red-600', 
            gradient: 'from-red-500/10 to-red-500/5' 
          },
          { 
            title: 'Open Vulnerabilities', 
            value: openVulnerabilities.toString(), 
            subtitle: 'Currently open', 
            icon: Shield, 
            color: 'text-orange-600', 
            gradient: 'from-orange-500/10 to-orange-500/5' 
          },
          { 
            title: 'Remediation Rate', 
            value: `${remediationRate.toFixed(2)}%`, 
            subtitle: 'Issues resolved', 
            icon: Shield, 
            color: 'text-green-600', 
            gradient: 'from-green-500/10 to-green-500/5' 
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <Card className={`bg-gradient-to-br ${stat.gradient} backdrop-blur-sm border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer h-full`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">{stat.title}</CardTitle>
                <motion.div whileHover={{ scale: 1.2, rotate: 5 }}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </motion.div>
              </CardHeader>
              <CardContent>
                <motion.div
                  className="text-2xl font-bold"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Vulnerability Trend Chart */}
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
            {vulnerabilityTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
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
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Security Events (Vulnerabilities) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
            <CardDescription>Latest discovered vulnerabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentVulnerabilities.length > 0 ? recentVulnerabilities.map((vuln, index) => (
                <motion.div
                  key={vuln.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-2 rounded-lg p-4 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold">{vuln.title}</h4>
                        <Badge className={
                          vuln.severity === 'critical' ? 'bg-red-600 text-white' :
                          vuln.severity === 'high' ? 'bg-orange-500 text-white' :
                          vuln.severity === 'medium' ? 'bg-yellow-500 text-black' :
                          'bg-blue-500 text-white'
                        }>
                          {vuln.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{vuln.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="font-medium">Reported by:</span> {getUserName(vuln.reported_by)}
                        </div>
                        <span>•</span>
                        <span>{formatDate(vuln.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent vulnerabilities
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
