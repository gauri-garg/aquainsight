
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, RequestedDataset, SubmissionStatus } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download, CircleHelp, CircleCheck, CircleX, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

const parseCSV = (csvData: string): { data: any[], headers: string[] } => {
  if (!csvData) return { data: [], headers: [] };
  const lines = csvData.trim().split("\n");
  if (lines.length < 1) return { data: [], headers: [] };

  const headers = lines[0].split(",").map(h => h.trim());
  if (lines.length < 2) return { data: [], headers };

  const data = lines.slice(1).map((line) => {
    const values = line.split(",");
    const entry: any = {};
    headers.forEach((header, index) => {
      const sanitizedHeader = header.replace(/[^a-zA-Z0-9]/g, '_');
      entry[sanitizedHeader] = values[index] ? values[index].trim() : null;
    });
    return entry;
  });

  return { data, headers };
};

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

export default function MySubmissionViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getRequestedDatasetById, role, user, deleteRequestedDataset } = useAuth();
  const { toast } = useToast();
  const [dataset, setDataset] = useState<RequestedDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [originalHeaders, setOriginalHeaders] = useState<string[]>([]);
  
  useEffect(() => {
    if (role && role === 'CMLRE') {
        router.push('/dashboard');
        return;
    }

    if (id && typeof id === "string" && user) {
      const fetchDataset = async () => {
        setLoading(true);
        try {
          const fetchedDataset = await getRequestedDatasetById(id);
          if (fetchedDataset && fetchedDataset.userId === user.uid) {
            setDataset(fetchedDataset);
            if (fetchedDataset.csvData) {
              const { data, headers } = parseCSV(fetchedDataset.csvData);
              setOriginalHeaders(headers);
              setParsedData(data);
            }
          } else {
            toast({
              title: "Not Found or Unauthorized",
              description: "Submission not found or you don't have permission to view it.",
              variant: "destructive",
            });
            router.push("/dashboard/my-submissions");
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: `Failed to fetch or process dataset: ${error.message}`,
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchDataset();
    }
  }, [id, getRequestedDatasetById, router, toast, role, user]);

  const handleDelete = async () => {
    if (!dataset || !user) return;
    setIsDeleting(true);
    try {
      await deleteRequestedDataset(dataset.id!, user.uid);
      toast({
        title: "Submission Deleted",
        description: `"${dataset.name}" has been successfully deleted.`,
      });
      router.push("/dashboard/my-submissions");
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };


  const handleDownloadXlsx = () => {
    if (!dataset?.csvData) {
        toast({ title: "No Data", description: "There is no data to download.", variant: "destructive" });
        return;
    }
    try {
        const lines = dataset.csvData.trim().split('\n');
        const data = lines.map(line => line.split(','));
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Dataset");
        XLSX.writeFile(wb, `${dataset.name}.xlsx`);
    } catch (error) {
        toast({ title: "Download Error", description: "Failed to create the XLSX file.", variant: "destructive" });
    }
  };

  const handleDownloadCsv = () => {
    if (!dataset?.csvData) {
      toast({ title: 'No Data', description: 'There is no data to download.', variant: 'destructive' });
      return;
    }
    try {
      const blob = new Blob([dataset.csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${dataset.name}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({ title: 'Download Error', description: 'Failed to create the CSV file.', variant: 'destructive' });
    }
  };

  if (loading || (role && role === 'CMLRE')) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dataset) {
    return null;
  }
  
  const PageHeader = () => (
     <div className="flex items-center justify-between">
        <div>
            <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/my-submissions">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Submissions
            </Link>
            </Button>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={handleDownloadXlsx}>
                <Download className="mr-2 h-4 w-4" />
                Download as XLSX
            </Button>
            <Button onClick={handleDownloadCsv} variant="secondary">
                <Download className="mr-2 h-4 w-4" />
                Download as CSV
            </Button>
            {dataset.status === 'pending' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
        </div>
      </div>
  );

  const MetadataCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>{dataset.name}</CardTitle>
        <CardDescription>{dataset.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
            <span className="text-muted-foreground">Submission Date</span>
            <span>{new Date(dataset.date).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={dataset.status} />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <div className="space-y-6">
        <PageHeader />
        <MetadataCard />
        <Card>
          <CardHeader><CardTitle>Submitted Data Preview</CardTitle></CardHeader>
          <CardContent>
          <Table>
              <TableHeader>
              <TableRow>
                  {originalHeaders.map(header => <TableHead key={header}>{header.replace(/_/g, ' ')}</TableHead>)}
              </TableRow>
              </TableHeader>
              <TableBody>
              {parsedData.length > 0 ? (
                  parsedData.map((entry, index) => (
                  <TableRow key={index}>
                      {originalHeaders.map(header => {
                          const sanitizedKey = header.replace(/[^a-zA-Z0-9]/g, '_');
                          return <TableCell key={header}>{entry[sanitizedKey] != null ? String(entry[sanitizedKey]) : 'N/A'}</TableCell>
                      })}
                  </TableRow>
                  ))
              ) : (
                  <TableRow><TableCell colSpan={originalHeaders.length} className="h-24 text-center">No data available in this file.</TableCell></TableRow>
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
              This action cannot be undone. This will permanently delete your submission &quot;{dataset?.name}&quot;.
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
