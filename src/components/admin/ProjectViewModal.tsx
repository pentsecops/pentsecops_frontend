import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { FolderKanban, Calendar, Users, FileText, Pencil, CheckSquare, AlertCircle } from 'lucide-react';
import { ProjectMembers } from './ProjectMembers';
import { ProjectTasks } from './ProjectTasks';
import axiosInstance from '../../services/axiosConfig';
import { TokenStorage } from '../../services/tokenStorage';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  memberCount?: number;
}

interface ProjectViewModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const ProjectViewModal: React.FC<ProjectViewModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'members' | 'tasks' | 'edit'>('details');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'active',
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleEditTab = () => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        start_date: project.start_date.split('T')[0],
        end_date: project.end_date.split('T')[0],
        status: project.status,
      });
      setActiveTab('edit');
    }
  };

  const handleUpdateProject = async () => {
    if (!project) return;
    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.post(
        `${API_BASE_URL}/v1/projects/${project.id}`,
        {
          name: formData.name,
          description: formData.description,
          status: formData.status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success('Project updated successfully');
        setActiveTab('details');
        onUpdate();
      }
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error(error.response?.data?.error || 'Failed to update project');
    }
  };

  const handleClose = () => {
    setActiveTab('details');
    onClose();
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="overflow-hidden flex flex-col !p-0 !gap-0"
        style={{ width: '98vw', maxWidth: '1800px', height: 'auto', maxHeight: '600px' }}
      >
        <DialogTitle className="sr-only">Project Details - {project.name}</DialogTitle>
        <DialogDescription className="sr-only">View and manage project information, members, tasks, and settings</DialogDescription>
        {/* Header */}
        <div className="relative p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b flex-shrink-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <FolderKanban className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
                  <p className="text-xs text-gray-600 mt-1">Project ID: {project.id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge
                  className={`text-xs px-2 py-1 ${
                    project.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {project.status === 'active' && '✓ '}
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
                <Badge variant="outline" className="text-xs px-2 py-1">
                  <Users className="w-3 h-3 mr-1" />
                  {project.memberCount || 0} Members
                </Badge>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-t pt-3">
            <Button
              variant={activeTab === 'details' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('details')}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Details
            </Button>
            <Button
              variant={activeTab === 'members' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('members')}
              className="flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              Members
            </Button>
            <Button
              variant={activeTab === 'tasks' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('tasks')}
              className="flex-1"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Tasks
            </Button>
            <Button
              variant={activeTab === 'edit' ? 'default' : 'outline'}
              size="sm"
              onClick={handleEditTab}
              className="flex-1"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden" style={{ maxHeight: '500px' }}>
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4 px-6 py-3">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Project Description</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-gray-700 leading-relaxed">{project.description}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <Label className="text-gray-500 text-sm font-medium mb-2 block">Start Date</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <p className="font-semibold text-base text-gray-900">
                          {formatDate(project.start_date)}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <Label className="text-gray-500 text-sm font-medium mb-2 block">Deadline</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-600" />
                        <p className="font-semibold text-base text-gray-900">
                          {formatDate(project.end_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Project Information</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <Label className="text-gray-500 text-sm font-medium mb-2 block">Created By</Label>
                      <p className="font-mono text-xs text-gray-600 break-all">{project.created_by}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <Label className="text-gray-500 text-sm font-medium mb-2 block">Created At</Label>
                      <p className="font-semibold text-sm text-gray-900">
                        {formatDate(project.created_at)}
                        <span className="block text-xs text-gray-500 mt-1">
                          {new Date(project.created_at).toLocaleTimeString()}
                        </span>
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <Label className="text-gray-500 text-sm font-medium mb-2 block">Last Updated</Label>
                      <p className="font-semibold text-sm text-gray-900">
                        {formatDate(project.updated_at)}
                        <span className="block text-xs text-gray-500 mt-1">
                          {new Date(project.updated_at).toLocaleTimeString()}
                        </span>
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <Label className="text-gray-500 text-sm font-medium mb-2 block">Project Status</Label>
                      <Badge
                        className={`text-sm px-3 py-1 ${
                          project.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {project.status === 'active' && '✓ '}
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="h-full -mx-6">
              <ProjectMembers
                projectId={project.id}
                projectName={project.name}
                isOpen={true}
                onClose={() => {}}
                embedded={true}
              />
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="h-full">
              <ProjectTasks
                projectId={project.id}
                projectName={project.name}
              />
            </div>
          )}

          {/* Edit Tab */}
          {activeTab === 'edit' && (
            <div className="h-full overflow-y-auto px-6 py-4">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Pencil className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 text-base">Edit Project Details</h3>
                      <p className="text-sm text-blue-700 mt-1">Update the project name, description, and status below.</p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  {/* Project Name */}
                  <div>
                    <Label htmlFor="modal_edit_name" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Project Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="modal_edit_name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter project name"
                      className="h-11"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="modal_edit_description" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Description
                    </Label>
                    <Textarea
                      id="modal_edit_description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter project description"
                      rows={5}
                      className="resize-none"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <Label htmlFor="modal_edit_status" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date Information Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-amber-900 text-sm mb-2">Important Note</p>
                      <p className="text-sm text-amber-700 mb-3">Project dates cannot be modified after creation.</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-amber-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-gray-600">Start Date</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formData.start_date && formatDate(formData.start_date)}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-amber-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-medium text-gray-600">Deadline</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formData.end_date && formatDate(formData.end_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2 pb-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('details')} 
                    className="flex-1 h-11"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateProject} 
                    className="flex-1 h-11 !bg-black hover:!bg-gray-900 !text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex-shrink-0 border-t pt-3 px-6 pb-3">
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
