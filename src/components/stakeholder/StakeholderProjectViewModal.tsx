import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { FolderKanban, Calendar, Users, FileText, CheckSquare } from 'lucide-react';
import { StakeholderProjectMembers } from './StakeholderProjectMembers';
import { StakeholderProjectTasks } from './StakeholderProjectTasks';

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

interface StakeholderProjectViewModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StakeholderProjectViewModal: React.FC<StakeholderProjectViewModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'members' | 'tasks'>('details');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
        <DialogDescription className="sr-only">View project information, members, and tasks</DialogDescription>
        {/* Header */}
        <div className="relative p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-b flex-shrink-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
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
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden" style={{ maxHeight: '500px' }}>
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4 px-6 py-3 overflow-y-auto h-full">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-4 h-4 text-green-600" />
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
            <div className="h-full overflow-y-auto">
              <StakeholderProjectMembers
                projectId={project.id}
                projectName={project.name}
              />
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="h-full">
              <StakeholderProjectTasks
                projectId={project.id}
                projectName={project.name}
              />
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
