
"use client";

import { useEffect, useState } from "react";
import { useAuth, RequestedDataset, SubmissionStatus } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, CircleCheck, CircleX, CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


const StatusBadge = ({ status }: { status: SubmissionStatus }) => {
    switch (status) {
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700"><CircleCheck className="mr-2 h-4 w-4" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><CircleX className="mr-2 h-4 w-4" />Rejected</Badge>;
      case "pending":
      default:
        return <Badge variant="outline"><CircleHelp className="mr-2 h-4 w-4" />Pending Review</Badge>;
    }
  };

export default function DataApprovalPage() {
  const {
    role,
    getRequestedDatasets,
    approveDatasetRequest,
    rejectDatasetRequest,
  } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RequestedDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [requestToReject, setRequestToReject] = useState<RequestedDataset | null>(null);

  const fetchRequests = async () => {
    try {
      const fetchedRequests = await getRequestedDatasets();
      setRequests(fetchedRequests);
    } catch (error: any) {
      toast({
        title: "Error fetching requests",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role && role !== "CMLRE") {
      router.push("/dashboard");
    } else if (role) {
      fetchRequests();
    }
  }, [role, router, toast]);

  const handleApprove = async (request: RequestedDataset) => {
    if (!request.id) return;
    setProcessingId(request.id);
    try {
      await approveDatasetRequest(request);
      toast({
        title: "Dataset Approved",
        description: `"${request.name}" has been added to the main datasets.`,
      });
      fetchRequests(); // Refetch to update status
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!requestToReject || !requestToReject.id) return;
    setProcessingId(requestToReject.id);
    try {
      await rejectDatasetRequest(requestToReject);
      toast({
        title: "Dataset Rejected",
        description: `"${requestToReject.name}" has been rejected and the user has been notified.`,
        variant: "destructive",
      });
       fetchRequests(); // Refetch to update status
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
      setShowRejectDialog(false);
      setRequestToReject(null);
    }
  };

  const confirmReject = (request: RequestedDataset) => {
    setRequestToReject(request);
    setShowRejectDialog(true);
  };
  
  const handleViewData = (requestId: string) => {
    router.push(`/dashboard/data-approval/${requestId}`);
  }

  if (loading || (role && role !== "CMLRE")) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Approval Queue</CardTitle>
            <CardDescription>
              Review and approve or reject dataset submissions from users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dataset Name</TableHead>
                  <TableHead>Submitted by</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <p className="truncate max-w-[200px]">{request.name}</p>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-md">{request.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>{request.submittedBy}</TableCell>
                      <TableCell>
                        {new Date(request.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewData(request.id!)}
                          disabled={processingId === request.id}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Data
                        </Button>
                        {request.status === 'pending' ? (
                            <>
                                <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleApprove(request)}
                                disabled={processingId === request.id}
                                >
                                {processingId === request.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Approve"
                                )}
                                </Button>
                                <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => confirmReject(request)}
                                disabled={processingId === request.id}
                                >
                                {processingId === request.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Reject"
                                )}
                                </Button>
                            </>
                        ) : (
                           <Badge variant={request.status === 'approved' ? 'default' : 'destructive'} className="capitalize">
                                Action Performed
                            </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No pending submissions.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently reject the dataset &quot;{requestToReject?.name}&quot; and remove its submission. The user will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!processingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={!!processingId}
              className="bg-destructive hover:bg-destructive/90"
            >
              {processingId === requestToReject?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Confirm Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
