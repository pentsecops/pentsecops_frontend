import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FileText, Download, Loader2, Calendar, User, FileIcon, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { projectApi, TaskSubmission } from '../../services/projectApi';
import { TokenStorage } from '../../services/tokenStorage';
import { SubmissionReviewDialog } from './SubmissionReviewDialog';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface TaskSubmissionsViewerProps {
  taskId: string;
  taskTitle: string;
  trigger?: React.ReactNode;
  embedded?: boolean;
}

export function TaskSubmissionsViewer({ taskId, taskTitle, trigger, embedded = false }: TaskSubmissionsViewerProps) {
  const [open, setOpen] = useState(false);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      loadSubmissions();
    }
  }, [open, taskId]);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      const data = await projectApi.getTaskSubmissions(taskId);
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAttachment = async (attachmentId: string, fileName: string) => {
    try {
      const token = TokenStorage.getAccessToken();
      const response = await fetch(
        `${API_BASE_URL}/v1/task-submission/attachments/${attachmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const contentType = response.headers.get('content-type');
      const blobWithType = new Blob([blob], { type: contentType || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blobWithType);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started');
    } catch (error) {
      console.error('Failed to download attachment:', error);
      toast.error('Failed to download attachment');
    }
  };

  const viewAttachment = async (attachmentId: string, fileName: string) => {
    try {
      const token = TokenStorage.getAccessToken();
      const response = await fetch(
        `${API_BASE_URL}/v1/task-submission/attachments/${attachmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to load file');
      
      const blob = await response.blob();
      const contentType = response.headers.get('content-type');
      const blobWithType = new Blob([blob], { type: contentType || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blobWithType);
      
      // Open in new tab
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        toast.error('Please allow pop-ups to view files');
        window.URL.revokeObjectURL(url);
        return;
      }
      
      // Clean up after new tab loads
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Failed to view attachment:', error);
      toast.error('Failed to view attachment');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusBadge = (submission: TaskSubmission) => {
    // Check if there are reviews
    if (submission.reviews && submission.reviews.length > 0) {
      const latestReview = submission.reviews[submission.reviews.length - 1];
      const status = latestReview.status;
      
      if (status === 'in_progress') {
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      }
      if (status === 'completed') {
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      }
    }
    
    // Legacy status support or no reviews
    const status = submission.status;
    if (!status || status === 'pending') {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      );
    }
    if (status === 'in_progress') {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    }
    if (status === 'completed') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    if (status === 'approved') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }
    if (status === 'rejected') {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    }
    return null;
  };

  const formatDate = (dateStr: string) => {
    const parts = dateStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (!parts) return dateStr;
    
    const [, year, month, day, hour24, minute] = parts;
    let hours = parseInt(hour24, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    
    return `${day}-${month}-${year} ${hours}:${minute} ${ampm}`;
  };

  const canReview = user?.role === 'admin' || user?.role === 'stakeholder';

  const submissionsContent = (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : !submissions || submissions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No submissions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission, index) => {
            const latestReview = submission.reviews && submission.reviews.length > 0 
              ? submission.reviews[submission.reviews.length - 1] 
              : null;
            const hasReviews = submission.reviews && submission.reviews.length > 0;
            const isCompleted = latestReview?.status === 'completed';
            const isInProgress = latestReview?.status === 'in_progress';
            
            return (
            <div key={submission.id || `submission-${index}`} className="border rounded-lg p-4 space-y-3">
              {/* Submission Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">Submission #{index + 1}</Badge>
                    {getStatusBadge(submission)}
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(submission.submitted_at)}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {canReview && !isCompleted && (
                    <SubmissionReviewDialog
                      submissionId={submission.id}
                      trigger={
                        <Button 
                          size="sm" 
                          className="bg-blue-500 hover:bg-blue-600 text-black font-semibold shadow-md border-0 px-4"
                        >
                          Review Submission
                        </Button>
                      }
                      onSuccess={loadSubmissions}
                    />
                  )}
                </div>
              </div>

              {/* Submission Notes */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Notes:</h4>
                <div 
                  className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded"
                  style={{ maxHeight: '100px', overflowY: 'auto' }}
                >
                  {submission.notes}
                </div>
              </div>

              {/* Review Information */}
              {hasReviews && (
                <div className="flex items-center gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-300 text-blue-700 font-semibold"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Reviews ({submission.reviews!.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Review History</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 py-4">
                        {submission.reviews!.map((review, reviewIndex) => (
                          <div key={review.id} className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-300 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-white font-semibold">
                                  Review #{reviewIndex + 1}
                                </Badge>
                                <Badge 
                                  className={review.status === 'completed' 
                                    ? 'bg-green-600 text-white font-semibold' 
                                    : 'bg-blue-600 text-white font-semibold'}
                                >
                                  {review.status === 'completed' ? '✓ Completed' : '⏳ In Progress'}
                                </Badge>
                              </div>
                              <span className="text-xs font-semibold text-gray-700">
                                {formatDate(review.reviewed_at)}
                              </span>
                            </div>
                            <div className="bg-white p-3 rounded border border-blue-200">
                              <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">
                                {review.review_notes}
                              </p>
                            </div>
                            <div className="text-xs font-semibold text-gray-700 mt-2 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Reviewed by {review.reviewer_role}
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* Attachments */}
              {submission.attachments && Array.isArray(submission.attachments) && submission.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">
                    Attachments ({submission.attachments.length})
                  </h4>
                  <div className="space-y-2">
                    {submission.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {attachment.file_name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatFileSize(attachment.file_size)}</span>
                              <span>•</span>
                              <span>{attachment.mime_type}</span>
                            </div>
                            {attachment.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                Note: {attachment.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewAttachment(attachment.id, attachment.file_name)}
                            className="flex-shrink-0"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadAttachment(attachment.id, attachment.file_name)}
                            className="flex-shrink-0"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )})}
        </div>
      )}
    </>
  );

  useEffect(() => {
    if (embedded) {
      loadSubmissions();
    }
  }, [embedded, taskId]);

  if (embedded) {
    return submissionsContent;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent 
        className="max-w-7xl w-[95vw] p-0"
        style={{ height: '90vh', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <DialogHeader 
          className="px-6 pt-6 pb-4 border-b"
          style={{ flexShrink: 0 }}
        >
          <DialogTitle>Task Submissions: {taskTitle}</DialogTitle>
        </DialogHeader>

        <div 
          className="px-6 py-4"
          style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}
        >
          {submissionsContent}
        </div>

        <div 
          className="flex justify-end px-6 py-4 border-t"
          style={{ flexShrink: 0 }}
        >
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
