import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { CheckCircle2, Clock, AlertCircle, Plus, Pencil, Trash2, UserPlus, Search, X } from 'lucide-react';
import axiosInstance from '../../services/axiosConfig';
import { TokenStorage } from '../../services/tokenStorage';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Task {
  id: string;
  project_id: string;
  assigned_to: string | null;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'assigned' | 'in_progress' | 'completed';
  deadline: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
}

interface ProjectTasksProps {
  projectId: string;
  projectName: string;
}

export const ProjectTasks: React.FC<ProjectTasksProps> = ({ projectId, projectName }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchUser, setSearchUser] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    deadline: '',
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.get(
        `${API_BASE_URL}/v1/projects/${projectId}/tasks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setTasks(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.get(
        `${API_BASE_URL}/v1/admin/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success && response.data.data.users) {
        // Transform the nested structure to flat user objects
        const transformedUsers = response.data.data.users.map((item: any) => ({
          id: item.profile_id, // Use profile_id for assignment
          user_id: item.user.id,
          username: `${item.profile.first_name} ${item.profile.last_name}`,
          email: item.user.email,
          full_name: `${item.profile.first_name} ${item.profile.last_name}`,
          role: item.user.role,
          specialization: item.profile.specialization || item.profile.company || '',
        }));
        console.log('Transformed users:', transformedUsers);
        setUsers(transformedUsers);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const handleCreateTask = async () => {
    if (!formData.title || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.post(
        `${API_BASE_URL}/v1/tasks`,
        {
          project_id: projectId,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          deadline: new Date(formData.deadline).toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Task created successfully');
        setIsCreateModalOpen(false);
        resetForm();
        fetchTasks();
      }
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.response?.data?.error || 'Failed to create task');
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || !formData.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.post(
        `${API_BASE_URL}/v1/tasks/${selectedTask.id}`,
        {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: selectedTask.status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Task updated successfully');
        setIsEditModalOpen(false);
        setSelectedTask(null);
        resetForm();
        fetchTasks();
      }
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error(error.response?.data?.error || 'Failed to update task');
    }
  };

  const handleAssignTask = async (userId: string) => {
    if (!selectedTask) return;

    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.post(
        `${API_BASE_URL}/v1/tasks/${selectedTask.id}/assign`,
        { pentester_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Task assigned successfully');
        setIsAssignModalOpen(false);
        setSelectedTask(null);
        setSearchUser('');
        fetchTasks();
      }
    } catch (error: any) {
      console.error('Error assigning task:', error);
      toast.error(error.response?.data?.error || 'Failed to assign task');
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.delete(
        `${API_BASE_URL}/v1/tasks/${selectedTask.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Task deleted successfully');
        setIsDeleteDialogOpen(false);
        setSelectedTask(null);
        fetchTasks();
      }
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error(error.response?.data?.error || 'Failed to delete task');
    }
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      deadline: task.deadline.split('T')[0],
    });
    setIsEditModalOpen(true);
  };

  const openAssignModal = (task: Task) => {
    setSelectedTask(task);
    setIsAssignModalOpen(true);
  };

  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      deadline: '',
    });
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
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'assigned': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getAssignedUserName = (userId: string | null) => {
    if (!userId) return 'Unassigned';
    const user = users.find(u => u.id === userId);
    return user ? user.full_name || user.username : 'Unknown User';
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const isPentester = user.role && user.role.toLowerCase().includes('pentester');
    const matchesSearch = !searchUser || 
      user.full_name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchUser.toLowerCase());
    
    return isPentester && matchesSearch;
  }) : [];

  console.log('Filtered pentesters:', filteredUsers);

  if (loading) {
    return <div className="p-6 text-center">Loading tasks...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gray-50" style={{ zIndex: 10 }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Project Tasks</h3>
            <p className="text-sm text-gray-600">{tasks.length} total tasks</p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="!bg-black hover:!bg-gray-900 !text-white shadow-sm px-4 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Tasks List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Plus className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium mb-2">No tasks found</p>
          <p className="text-gray-500 text-sm mb-4">Create your first task to get started!</p>
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="!bg-black hover:!bg-gray-900 !text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
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
                    <span>Assigned to: <span className="font-medium text-gray-700">{getAssignedUserName(task.assigned_to)}</span></span>
                    <span>Deadline: <span className="font-medium text-gray-700">{formatDate(task.deadline)}</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAssignModal(task)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(task)}
                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(task)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Create Task Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="!max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task to {projectName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="create_title">Task Title *</Label>
              <Input
                id="create_title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="create_description">Description</Label>
              <Textarea
                id="create_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create_priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
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
              <div>
                <Label htmlFor="create_deadline">Deadline *</Label>
                <Input
                  id="create_deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} className="!bg-black hover:!bg-gray-900 !text-white">
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="!max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit_title">Task Title *</Label>
              <Input
                id="edit_title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="edit_priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setSelectedTask(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTask} className="!bg-black hover:!bg-gray-900 !text-white">
              Update Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Task Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="!max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Task to User</DialogTitle>
            <DialogDescription>Select a user to assign this task</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No users found</p>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleAssignTask(user.id)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.specialization && (
                          <p className="text-xs text-gray-500 mt-1">{user.specialization}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAssignModalOpen(false); setSelectedTask(null); setSearchUser(''); }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTask?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setIsDeleteDialogOpen(false); setSelectedTask(null); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="!bg-red-600 hover:!bg-red-700 !text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
