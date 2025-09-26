
"use client";

import { useEffect, useState } from "react";
import { useAuth, RequestedDataset } from "@/hooks/use-auth";
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
import { Loader2, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  useEffect(() => {
    if (role && role !== "CMLRE") {
      router.push("/dashboard");
    } else if (role) {
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
      fetchRequests();
    }
  }, [role, router, getRequestedDatasets, toast]);

  const handleApprove = async (request: RequestedDataset) => {
    if (!request.id) return;
    setProcessingId(request.id);
    try {
      await approveDatasetRequest(request);
      setRequests(requests.filter((r) => r.id !== request.id));
      toast({
        title: "Dataset Approved",
        description: `"${request.name}" has been added to the main datasets.`,
      });
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

  const handleReject = async (requestId: string, requestName: string) => {
    setProcessingId(requestId);
    try {
      await rejectDatasetRequest(requestId);
      setRequests(requests.filter((r) => r.id !== requestId));
      toast({
        title: "Dataset Rejected",
        description: `"${requestName}" has been rejected.`,
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
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
                <TableHead>Description</TableHead>
                <TableHead>Submitted by</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.name}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <p className="truncate max-w-xs">
                              {request.description}
                            </p>
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
                    <TableCell className="text-right space-x-2">
                       <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleViewData(request.id!)}
                        disabled={processingId === request.id}
                      >
                         <Eye className="mr-2 h-4 w-4" />
                         View Data
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
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
                        onClick={() => handleReject(request.id!, request.name)}
                        disabled={processingId === request.id}
                      >
                        {processingId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Reject"
                        )}
                      </Button>
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
  );
}
