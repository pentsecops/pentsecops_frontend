import axiosInstance from './axiosConfig';
import { TokenStorage } from './tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UserProject {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  added_at: string;
  project: Project;
}

export interface Task {
  id: string;
  project_id: string;
  assigned_to: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'assigned' | 'in_progress' | 'closed';
  deadline: string;
  created_at: string;
  updated_at: string;
}

export interface TaskSubmissionAttachment {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  notes?: string;
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  pentester_id?: string;
  submitted_by?: string;
  notes: string;
  submitted_at: string;
  attachments: TaskSubmissionAttachment[];
  status?: string;
  review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  reviews?: {
    id: string;
    submission_id: string;
    reviewer_id: string;
    reviewer_role: string;
    status: string;
    review_notes: string;
    reviewed_at: string;
  }[];
}

export const projectApi = {
  // Get all projects
  async getProjects(): Promise<Project[]> {
    const token = TokenStorage.getAccessToken();
    const response = await axiosInstance.get(`${API_BASE_URL}/v1/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  // Get user's projects
  async getUserProjects(): Promise<UserProject[]> {
    const token = TokenStorage.getAccessToken();
    const response = await axiosInstance.get(`${API_BASE_URL}/v1/user/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  // Get project tasks
  async getProjectTasks(projectId: string): Promise<Task[]> {
    const token = TokenStorage.getAccessToken();
    const response = await axiosInstance.get(`${API_BASE_URL}/v1/projects/${projectId}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  // Submit task with attachments
  async submitTask(taskId: string, notes: string, attachments: File[], attachmentNotes: string[]): Promise<void> {
    const token = TokenStorage.getAccessToken();
    const formData = new FormData();
    formData.append('notes', notes);
    
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });
    
    attachmentNotes.forEach((note) => {
      formData.append('attachment_notes', note);
    });

    await axiosInstance.post(`${API_BASE_URL}/v1/task-submission/${taskId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get task submissions
  async getTaskSubmissions(taskId: string): Promise<TaskSubmission[]> {
    const token = TokenStorage.getAccessToken();
    const response = await axiosInstance.get(`${API_BASE_URL}/v1/task-submission/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Transform the response to match the expected format
    return response.data.data.map((item: any) => ({
      id: item.submission.id,
      task_id: item.submission.task_id,
      pentester_id: item.submission.pentester_id,
      notes: item.submission.notes,
      submitted_at: item.submission.submitted_at,
      attachments: item.attachments || [],
      status: item.submission.status,
      review_notes: item.submission.review_notes,
      reviewed_by: item.submission.reviewed_by,
      reviewed_at: item.submission.reviewed_at,
      reviews: item.reviews || [],
    }));
  },

  // Review task submission
  async reviewSubmission(submissionId: string, status: 'completed' | 'in_progress', reviewNotes: string): Promise<void> {
    const token = TokenStorage.getAccessToken();
    await axiosInstance.post(
      `${API_BASE_URL}/v1/task-submission/${submissionId}/review`,
      { status, review_notes: reviewNotes },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
};
