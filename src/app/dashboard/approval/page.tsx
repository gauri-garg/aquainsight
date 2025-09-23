
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/hooks/use-auth";
import { firestore } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Submission {
  id: string;
  studentName: string;
  datasetName: string;
  datasetType: string;
  fileUrl: string;
  submittedAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function ApprovalPage() {
  const { role } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (role && role !== "CMLRE") {
      router.push("/dashboard");
    }
  }, [role, router]);

  useEffect(() => {
    if (role !== "CMLRE") return;

    const q = query(
      collection(firestore, "submissions"),
      where("status", "==", "pending")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const pendingSubmissions: Submission[] = [];
      querySnapshot.forEach((doc) => {
        pendingSubmissions.push({ id: doc.id, ...doc.data() } as Submission);
      });
      setSubmissions(pendingSubmissions);
    }, (error) => {
        console.error("Error fetching submissions:", error);
        toast({
            title: "Error fetching data",
            description: "Could not retrieve submissions from the database.",
            variant: "destructive"
        })
    });

    return () => unsubscribe();
  }, [role, toast, router]);

  const handleReview = async (submissionId: string, newStatus: "approved" | "rejected", submission: Submission) => {
    const submissionRef = doc(firestore, "submissions", submissionId);
    try {
      await updateDoc(submissionRef, { status: newStatus, reviewedAt: serverTimestamp() });
      
      if (newStatus === 'approved') {
        const datasetCollectionName = submission.datasetType.toLowerCase().replace(/ /g, '_');
        await addDoc(collection(firestore, `datasets/${datasetCollectionName}/items`), {
          datasetName: submission.datasetName,
          fileUrl: submission.fileUrl,
          approvedAt: serverTimestamp(),
          submittedBy: submission.studentName,
        });
      }
      
      toast({
        title: `Submission ${newStatus}`,
        description: `The dataset "${submission.datasetName}" has been ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (role !== "CMLRE") {
    return (
      <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to view this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Submissions Review</CardTitle>
        <CardDescription>
          Review, approve, or reject datasets submitted by researchers and students.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dataset Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">
                    {submission.datasetName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{submission.datasetType}</Badge>
                  </TableCell>
                  <TableCell>{submission.studentName}</TableCell>
                  <TableCell>
                    {new Date(submission.submittedAt.seconds * 1000).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3 w-3 mr-2" />
                          View Data
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-600 hover:bg-green-50 border-green-200 hover:border-green-300"
                        onClick={() => handleReview(submission.id, "approved", submission)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
                        onClick={() => handleReview(submission.id, "rejected", submission)}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No pending submissions.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
