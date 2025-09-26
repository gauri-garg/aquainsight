
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
import { Loader2, Eye, CircleHelp, CircleCheck, CircleX } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RequestedDataset[]>([]);
  const [loading, setLoading] = useState(true);

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
  );
}
