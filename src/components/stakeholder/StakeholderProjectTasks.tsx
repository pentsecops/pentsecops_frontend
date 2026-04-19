import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';
import axiosInstance from '../../services/axiosConfig';
import { TokenStorage } from '../../services/tokenStorage';
import { toast } from 'sonner';
import { TaskSubmissionsViewer } from '../shared/TaskSubmissionsViewer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Task {
  id: string;
  project_id: string;
  assigned_to: string | null;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'assigned' | 'in_progress' | 'closed';
  deadline: string;
  created_at: string;
  updated_at: string;
}

interface StakeholderProjectTasksProps {
  projectId: string;
  projectName: string;
}

export const StakeholderProjectTasks: React.FC<StakeholderProjectTasksProps> = ({ projectId, projectName }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [pentesterNames, setPentesterNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.get(
        `${API_BASE_URL}/v1/projects/${projectId}/tasks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        const tasksData = response.data.data || [];
        setTasks(tasksData);
        
        // Fetch all users from messages API
        const usersResponse = await axiosInstance.get(
          `${API_BASE_URL}/v1/messages/users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (usersResponse.data.success) {
          const allUsers = usersResponse.data.data || [];
          const names = new Map<string, string>();
          
          allUsers.forEach((user: any) => {
            names.set(user.id, `${user.first_name} ${user.last_name}`);
          });
          
          setPentesterNames(names);
        }
      }
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'closed': return <CheckCircle2 className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'assigned': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getAssignedUserName = (userId: string | null) => {
    if (!userId) return 'Unassigned';
    return pentesterNames.get(userId) || 'Loading...';
  };

  if (loading) {
    return <div className="p-6 text-center">Loading tasks...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Project Tasks</h3>
          <p className="text-sm text-gray-600">{tasks.length} total tasks</p>
        </div>
      </div>

      {/* Tasks List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium mb-2">No tasks found</p>
            <p className="text-gray-500 text-sm">No tasks have been created for this project yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      <Badge className={`${getPriorityColor(task.priority)} text-xs border`}>
                        {task.priority.toUpperCase()}
                      </Badge>
                      <Badge className={`${getStatusColor(task.status)} text-xs flex items-center gap-1`}>
                        {getStatusIcon(task.status)}
                        {task.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Assigned to: <span className="font-medium text-gray-700">{getAssignedUserName(task.assigned_to)}</span>
                      </span>
                      <span>
                        Deadline: <span className="font-medium text-gray-700">{formatDate(task.deadline)}</span>
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <TaskSubmissionsViewer
                      taskId={task.id}
                      taskTitle={task.title}
                      trigger={
                        <Button size="sm" variant="outline" className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          View Submissions
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
