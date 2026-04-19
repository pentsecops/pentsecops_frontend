import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Loader2, Calendar, User, AlertCircle, CheckCircle2, Clock, ChevronRight, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '../../services/axiosConfig';
import { TokenStorage } from '../../services/tokenStorage';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TaskSubmissionsViewer } from '../shared/TaskSubmissionsViewer';

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

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
}

export function AdminTaskBoard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadTasks(selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.get(
        `${API_BASE_URL}/v1/admin/projects?page=1&limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Projects API response:', response.data);
      
      if (response.data.success) {
        // Handle both response structures: data.projects or data array
        const projectsData = response.data.data?.projects || response.data.data || [];
        console.log('Extracted projects:', projectsData);
        setProjects(projectsData);
        if (projectsData.length > 0) {
          setSelectedProject(projectsData[0]);
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async (projectId: string) => {
    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.get(
        `${API_BASE_URL}/v1/projects/${projectId}/tasks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setTasks(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
      setTasks([]);
    }
  };

  const loadUsers = async () => {
    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.get(
        `${API_BASE_URL}/v1/admin/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Users API response:', response.data);
      
      if (response.data.success) {
        const usersData = response.data.data?.users;
        
        // Handle null or undefined users
        if (!usersData || !Array.isArray(usersData)) {
          console.log('No users data available');
          setUsers([]);
          return;
        }
        
        const transformedUsers = usersData
          .filter((item: any) => {
            // Only include items that have profile data with names
            return item && 
                   item.profile && 
                   item.profile.first_name && 
                   item.profile.last_name;
          })
          .map((item: any) => ({
            id: item.profile_id,
            full_name: `${item.profile.first_name} ${item.profile.last_name}`,
            email: item.user.email,
            role: item.user.role,
          }));
        console.log('Transformed users for task assignment:', transformedUsers);
        setUsers(transformedUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]); // Set empty array on error
    }
  };

  const handleDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const statusMap: any = {
      'assigned': 'assigned',
      'in_progress': 'in_progress',
      'completed': 'closed'
    };
    const newStatus = statusMap[destination.droppableId];

    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.post(
        `${API_BASE_URL}/v1/tasks/${draggableId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Task status updated');
        if (selectedProject) {
          loadTasks(selectedProject.id);
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task status');
    }
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return 'Unassigned';
    const user = users.find(u => u.id === userId);
    return user ? user.full_name : 'Unknown User';
  };

  const priorityColors = {
    'low': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const statusLabels = {
    'assigned': 'Assigned',
    'in_progress': 'In Progress',
    'completed': 'Completed'
  };

  const statusIcons = {
    'assigned': <AlertCircle className="w-4 h-4" />,
    'in_progress': <Clock className="w-4 h-4" />,
    'completed': <CheckCircle2 className="w-4 h-4" />
  };

  const statusColors = {
    'assigned': 'bg-slate-100 dark:bg-slate-800',
    'in_progress': 'bg-blue-50 dark:bg-blue-950',
    'completed': 'bg-green-50 dark:bg-green-950'
  };

  const statuses = ['assigned', 'in_progress', 'completed'];

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Map 'closed' status from API to 'completed' and 'submitted' to 'in_progress' for display
  const normalizedTasks = tasks.map(task => ({
    ...task,
    status: task.status === 'closed' ? 'completed' : task.status === 'submitted' ? 'in_progress' : task.status
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Left Side - Projects List */}
      <div className="w-80 flex flex-col space-y-4">
        <div>
          <h2 className="text-xl font-bold mb-2">Projects</h2>
          <p className="text-sm text-muted-foreground mb-4">{projects.length} total projects</p>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No projects found</p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const projectTasks = tasks.filter(t => t.project_id === project.id);
              const isSelected = selectedProject?.id === project.id;
              
              return (
                <Card
                  key={project.id}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                      : 'hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{project.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {project.status}
                        </Badge>
                        {isSelected && (
                          <span className="text-xs text-muted-foreground">
                            {projectTasks.length} tasks
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                      isSelected ? 'rotate-90' : ''
                    }`} />
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Right Side - Kanban Board */}
      <div className="flex-1 flex flex-col">
        {selectedProject ? (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-bold">{selectedProject.name} - Tasks</h2>
              <p className="text-sm text-muted-foreground">
                Drag and drop tasks to update their status
              </p>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
                {statuses.map((status) => {
                  const statusTasks = normalizedTasks.filter(t => t.status === status);

                  return (
                    <div key={status} className="flex flex-col h-full">
                      <div className={`${statusColors[status]} rounded-t-lg p-3 border-b`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {statusIcons[status]}
                            <h3 className="font-semibold text-sm">{statusLabels[status]}</h3>
                          </div>
                          <Badge variant="secondary">{statusTasks.length}</Badge>
                        </div>
                      </div>

                      <Droppable droppableId={status}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 overflow-y-auto p-3 space-y-2 ${statusColors[status]} rounded-b-lg transition-colors ${
                              snapshot.isDraggingOver ? 'ring-2 ring-blue-400' : ''
                            }`}
                          >
                            {statusTasks.map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`bg-white dark:bg-slate-800 p-3 rounded-lg border shadow-sm hover:shadow-md transition-all ${
                                      snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400 rotate-2' : ''
                                    }`}
                                  >
                                    <div className="space-y-2">
                                      <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-medium text-sm flex-1">{task.title}</h4>
                                        <Badge className={priorityColors[task.priority]} variant="outline">
                                          {task.priority}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {task.description}
                                      </p>
                                      <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <User className="w-3 h-3" />
                                          {getUserName(task.assigned_to)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {new Date(task.deadline).toLocaleDateString()}
                                        </div>
                                      </div>
                                      <div className="pt-2">
                                        <TaskSubmissionsViewer
                                          taskId={task.id}
                                          taskTitle={task.title}
                                          trigger={
                                            <Button size="sm" variant="outline" className="w-full text-xs">
                                              <Eye className="w-3 h-3 mr-1" />
                                              View Submissions
                                            </Button>
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {statusTasks.length === 0 && !snapshot.isDraggingOver && (
                              <div className="text-center py-8 text-muted-foreground text-sm">
                                No tasks
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No project selected</p>
              <p className="text-sm">Select a project from the left to view its tasks</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
