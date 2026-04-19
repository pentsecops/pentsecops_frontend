import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Loader2, Calendar, AlertCircle, CheckCircle2, Clock, ChevronRight, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { projectApi, UserProject, Task } from '../../services/projectApi';
import { TaskSubmissionsViewer } from '../shared/TaskSubmissionsViewer';

export function StakeholderTaskBoard() {
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<UserProject | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadTasks(selectedProject.project_id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectApi.getUserProjects();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async (projectId: string) => {
    try {
      const data = await projectApi.getProjectTasks(projectId);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
    }
  };

  const priorityColors = {
    'low': 'bg-blue-100 text-blue-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'critical': 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    'assigned': 'Assigned',
    'in_progress': 'In Progress',
    'closed': 'Closed'
  };

  const statusIcons = {
    'assigned': <AlertCircle className="w-4 h-4" />,
    'in_progress': <Clock className="w-4 h-4" />,
    'closed': <CheckCircle2 className="w-4 h-4" />
  };

  const statusColors = {
    'assigned': 'bg-slate-100',
    'in_progress': 'bg-blue-50',
    'closed': 'bg-green-50'
  };

  const statuses = ['assigned', 'in_progress', 'closed'];

  const filteredProjects = (projects || []).filter(project =>
    project.project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Left Side - Projects List */}
      <div className="w-80 flex flex-col space-y-4">
        <div>
          <h2 className="text-xl font-bold mb-2">My Projects</h2>
          <p className="text-sm text-muted-foreground mb-4">{projects.length} assigned projects</p>
          
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
            filteredProjects.map((userProject) => {
              const projectTasks = (tasks || []).filter(t => t.project_id === userProject.project_id);
              const isSelected = selectedProject?.project_id === userProject.project_id;
              
              return (
                <Card
                  key={userProject.id}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'ring-2 ring-green-500 bg-green-50' 
                      : 'hover:shadow-md hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedProject(userProject)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{userProject.project.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {userProject.project.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {userProject.project.status}
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

      {/* Right Side - Task View */}
      <div className="flex-1 flex flex-col">
        {selectedProject ? (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-bold">{selectedProject.project.name} - Tasks</h2>
              <p className="text-sm text-muted-foreground">
                View project tasks and their progress
              </p>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
              {statuses.map((status) => {
                const statusTasks = (tasks || []).filter(t => t.status === status);

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

                    <div className={`flex-1 overflow-y-auto p-3 space-y-2 ${statusColors[status]} rounded-b-lg`}>
                      {statusTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all"
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
                            <div className="flex items-center justify-end pt-2 border-t text-xs text-muted-foreground">
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
                      ))}
                      {statusTasks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No tasks
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
