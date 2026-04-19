import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { FileText, Download, Eye, CheckCircle, Clock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { adminApiService } from '../../services/adminApi';

interface Report {
  id: string;
  title: string;
  submittedBy: string;
  submittedDate: string;
  project: string;
  status: 'Received' | 'Under Review' | 'Shared' | 'Remediated';
  vulnerabilities: number;
  evidence: number;
}

export function ReportManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [evidencePage, setEvidencePage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 5;
  const evidencePerPage = 3;

  useEffect(() => {
    loadReports();
  }, [currentPage, statusFilter]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };

      const response = await adminApiService.getReports(params);
      if (response.success) {
        setReports(response.data?.reports || []);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received': return 'secondary';
      case 'Under Review': return 'default';
      case 'Shared': return 'outline';
      case 'Remediated': return 'outline';
      default: return 'secondary';
    }
  };

  // Pagination logic is handled by API often, but if basic list:
  // For now assuming API returns paginated or we filter client side if small
  // But let's keep the filter/slice logic if the API returns all for now or we trust the state matches
  // Actually, if we use the API params, we should use the API response directly.
  // Let's assume for this step, we just render `reports` which are already filtered/paginated by API if supported
  // OR we keep client-side pagination if the API returns a full list.
  // Given the previous pattern, let's just display the `reports` list directly, assuming API handles pagination if called with page
  // BUT the provided code had client-side slicing. Let's stick to client-side slicing if the API returns `reports` as a flat list, 
  // OR just render `reports` if it's the page. 
  // Safety: Let's assume `reports` is the current page data.

  // Re-reading instructions: "Fetch reports using adminApiService.getReports()". 
  // I'll render `reports` directly.

  const evidenceFiles = [
    { name: 'sql_injection_proof.png', report: 'R001', size: '2.3 MB', date: '2 hours ago' },
    { name: 'xss_vulnerability_log.txt', report: 'R002', size: '145 KB', date: '5 hours ago' },
    { name: 'network_scan_results.pdf', report: 'R003', size: '8.7 MB', date: '1 day ago' },
    { name: 'auth_bypass_video.mp4', report: 'R001', size: '45.8 MB', date: '2 days ago' },
    { name: 'ssl_cert_analysis.txt', report: 'R002', size: '12 KB', date: '3 days ago' },
  ];

  const paginatedEvidence = evidenceFiles.slice(
    (evidencePage - 1) * evidencePerPage,
    evidencePage * evidencePerPage
  );

  const evidenceTotalPages = Math.ceil(evidenceFiles.length / evidencePerPage);

  const handleDownload = (id: string, fileName: string) => {
    // Simulate API download
    toast.success(`Downloading report ${fileName}...`);
    // In a real app: window.open(`${API_BASE_URL}/admin/reports/${id}/download`);
  };

  const handleView = (report: Report) => {
    setViewingReport(report);
  };

  const handleDownloadEvidence = (fileName: string) => {
    const evidenceContent = `Evidence file: ${fileName}`;
    const blob = new Blob([evidenceContent], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Downloaded ${fileName}`);
  };

  if (isLoading && reports.length === 0) {
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
          <h2>Report Management</h2>
          <p className="text-muted-foreground">Review, download, and share pentesting reports</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{reports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {reports.filter(r => r.status === 'Under Review').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Remediated</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-500">
              {reports.filter(r => r.status === 'Remediated').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="Received">Received</SelectItem>
              <SelectItem value="Under Review">Under Review</SelectItem>
              <SelectItem value="Shared">Shared</SelectItem>
              <SelectItem value="Remediated">Remediated</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>Manage pentesting reports and evidence</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vulnerabilities</TableHead>
                <TableHead>Evidence Files</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length > 0 ? (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono">{report.id}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        {report.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{report.submittedBy}</TableCell>
                    <TableCell className="text-muted-foreground">{report.submittedDate}</TableCell>
                    <TableCell>{report.project}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(report.status) as any}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{report.vulnerabilities}</TableCell>
                    <TableCell>{report.evidence}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleView(report)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDownload(report.id, report.title)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                    No reports found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">Page {currentPage}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Recent Evidence */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Evidence Uploads</CardTitle>
          <CardDescription>Latest screenshots, logs, and supporting files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedEvidence.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-mono text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">Report {file.report} • {file.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{file.date}</span>
                  <Button size="sm" variant="ghost" onClick={() => handleDownloadEvidence(file.name)}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {((evidencePage - 1) * evidencePerPage) + 1} to {Math.min(evidencePage * evidencePerPage, evidenceFiles.length)} of {evidenceFiles.length} files
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEvidencePage(Math.max(1, evidencePage - 1))}
                disabled={evidencePage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">{evidencePage} of {evidenceTotalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEvidencePage(Math.min(evidenceTotalPages, evidencePage + 1))}
                disabled={evidencePage === evidenceTotalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Report Viewer Dialog */}
      <Dialog open={!!viewingReport} onOpenChange={() => setViewingReport(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingReport?.title}</DialogTitle>
            <DialogDescription>
              Report {viewingReport?.id} • Submitted by {viewingReport?.submittedBy} on {viewingReport?.submittedDate}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Project</h4>
                <p className="text-sm text-muted-foreground">{viewingReport?.project}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <Badge variant={getStatusColor(viewingReport?.status || '') as any}>
                  {viewingReport?.status}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Vulnerabilities Found</h4>
                <p className="text-sm text-muted-foreground">{viewingReport?.vulnerabilities}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Evidence Files</h4>
                <p className="text-sm text-muted-foreground">{viewingReport?.evidence}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Executive Summary</h4>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">This security assessment identified {viewingReport?.vulnerabilities} vulnerabilities across the {viewingReport?.project} infrastructure. Critical findings require immediate attention.</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
