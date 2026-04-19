import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { projectApi } from '../../services/projectApi';

interface SubmissionReviewDialogProps {
  submissionId: string;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function SubmissionReviewDialog({ submissionId, trigger, onSuccess }: SubmissionReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReview = async (status: 'completed' | 'in_progress') => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide review notes');
      return;
    }

    try {
      setIsSubmitting(true);
      await projectApi.reviewSubmission(submissionId, status, reviewNotes);
      toast.success(`Submission marked as ${status === 'completed' ? 'completed' : 'in progress'} successfully`);
      setOpen(false);
      setReviewNotes('');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to review submission:', error);
      toast.error('Failed to review submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review Submission</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="review-notes">Review Notes *</Label>
            <Textarea
              id="review-notes"
              placeholder="Provide feedback on the submission..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)} 
            disabled={isSubmitting}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleReview('in_progress')}
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 text-black font-semibold shadow-md border-0 px-4"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Clock className="w-4 h-4 mr-2" />
            )}
            Mark In Progress
          </Button>
          <Button
            onClick={() => handleReview('completed')}
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 text-black font-semibold shadow-md border-0 px-4"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Mark Completed
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
