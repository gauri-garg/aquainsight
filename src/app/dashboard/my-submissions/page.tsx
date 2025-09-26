
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
import { Loader2, Eye, CircleHelp, CircleCheck, CircleX, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

export default function MySubmissionsPage() {
  const {
    role,
    user,
    getRequestedDatasetsByUserId,
    deleteRequestedDataset,
  } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RequestedDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<RequestedDataset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    if (role && role === "CMLRE") {
      router.push("/dashboard");
    } else if (role && user) {
      const fetchRequests = async () => {
        try {
          const fetchedRequests = await getRequestedDatasetsByUserId(user.uid);
          setRequests(fetchedRequests);
        } catch (error: any) {
          toast({
            title: "Error fetching submissions",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchRequests();
    }
  }, [role, user, router, getRequestedDatasetsByUserId, toast]);

  const confirmDelete = (request: RequestedDataset) => {
    setRequestToDelete(request);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!requestToDelete || !user) return;
    setIsDeleting(true);
    try {
      await deleteRequestedDataset(requestToDelete.id!, user.uid);
      setRequests(requests.filter((d) => d.id !== requestToDelete.id));
      toast({
        title: "Submission Deleted",
        description: `"${requestToDelete.name}" has been successfully deleted.`,
      });
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setRequestToDelete(null);
    }
  };
  
  const handleViewData = (requestId: string) => {
    router.push(`/dashboard/my-submissions/${requestId}`);
  }

  if (loading || (role && role === "CMLRE")) {
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
            <CardTitle>My Submissions</CardTitle>
            <CardDescription>
              View the status of your dataset submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dataset Name</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>
                        {new Date(request.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleViewData(request.id!)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        {request.status === 'pending' && (
                           <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => confirmDelete(request)}
                            disabled={isDeleting && requestToDelete?.id === request.id}
                          >
                             {isDeleting && requestToDelete?.id === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                               <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                               </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      You have not submitted any datasets.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your submission &quot;{requestToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
