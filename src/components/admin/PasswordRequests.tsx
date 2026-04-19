import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { RefreshCw, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '../../services/axiosConfig';
import { TokenStorage } from '../../services/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface PasswordRequest {
  id: string;
  user_id: string;
  user_email: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export function PasswordRequests() {
  const [requests, setRequests] = useState<PasswordRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{ id: string; email: string; action: 'accepted' | 'rejected' } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.get(`${API_BASE_URL}/v1/forgot-password-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.requests) {
        setRequests(response.data.requests);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load password requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest) return;

    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.post(
        `${API_BASE_URL}/v1/forgot-password-request/${selectedRequest.id}`,
        { status: selectedRequest.action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        toast.success(`Password request ${selectedRequest.action}`);
        loadRequests();
        setIsDialogOpen(false);
        setSelectedRequest(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update request status');
    }
  };

  const openConfirmDialog = (id: string, email: string, action: 'accepted' | 'rejected') => {
    setSelectedRequest({ id, email, action });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (isLoading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Password Reset Requests</h2>
          <p className="text-muted-foreground">Manage user password reset requests</p>
        </div>
        <Button variant="outline" onClick={loadRequests} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Requests ({requests.length})</CardTitle>
          <CardDescription>Review and manage password reset requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>User Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Clock className="w-12 h-12 mb-2 opacity-20" />
                        <p>No password reset requests</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{request.user_email}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')} {new Date(request.created_at).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(request.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')} {new Date(request.updated_at).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          {request.status === 'pending' ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openConfirmDialog(request.id, request.user_email, 'accepted')}
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openConfirmDialog(request.id, request.user_email, 'rejected')}
                                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">No actions available</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedRequest?.action === 'accepted' ? 'Accept Password Reset?' : 'Reject Password Reset?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRequest?.action === 'accepted' ? (
                <>
                  You are about to accept the password reset request for{' '}
                  <span className="font-semibold">{selectedRequest?.email}</span>. 
                  The user will receive a new password via email.
                </>
              ) : (
                <>
                  You are about to reject the password reset request for{' '}
                  <span className="font-semibold">{selectedRequest?.email}</span>. 
                  The user will be notified of the rejection.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRequest(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              className={
                selectedRequest?.action === 'accepted'
                  ? '!bg-green-600 hover:!bg-green-700 !text-white'
                  : '!bg-red-600 hover:!bg-red-700 !text-white'
              }
            >
              {selectedRequest?.action === 'accepted' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 !text-white" />
                  Accept Request
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2 !text-white" />
                  Reject Request
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
