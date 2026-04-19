import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar, AlertCircle } from 'lucide-react';
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
}

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
      });
    }
  }, [project]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleUpdate = async () => {
    if (!project || !formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

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
        onUpdate();
        onClose();
      }
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error(error.response?.data?.error || 'Failed to update project');
    }
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update project information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Project Name */}
          <div>
            <Label htmlFor="edit_project_name" className="text-sm font-medium text-gray-700">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit_project_name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name"
              className="mt-1.5"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="edit_project_description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="edit_project_description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter project description"
              rows={4}
              className="mt-1.5"
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="edit_project_status" className="text-sm font-medium text-gray-700">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Project Dates (Read-only)</p>
                <p className="text-xs text-gray-500 mt-0.5">Dates cannot be modified after project creation</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-600">Start Date</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatDate(project.start_date)}</p>
              </div>
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-gray-600">Deadline</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatDate(project.end_date)}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700">
            Update Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
