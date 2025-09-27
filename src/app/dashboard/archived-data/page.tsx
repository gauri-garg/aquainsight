
"use client";

import { useEffect, useState } from "react";
import { useAuth, ArchivedSubmission, SubmissionStatus } from "@/hooks/use-auth";
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
import { Loader2, Trash2, Archive, FileText, CircleHelp, CircleCheck, CircleX } from "lucide-react";
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
      default:
        return <Badge variant="outline"><CircleHelp className="mr-2 h-4 w-4" />Pending</Badge>;
    }
};

const TypeBadge = ({ type }: { type: 'Dataset' | 'Submission' }) => {
    return (
        <Badge variant={type === 'Dataset' ? 'secondary' : 'outline'}>
            {type === 'Dataset' ? <FileText className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
            {type}
        </Badge>
    );
};


export default function ArchivedDataPage() {
  const { role, getArchivedData, permanentlyDeleteSubmission } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [archives, setArchives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const fetchedArchives = await getArchivedData();
      setArchives(fetchedArchives);
    } catch (error: any) {
      toast({
        title: "Error fetching archives",
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
      fetchArchives();
    }
  }, [role, router]);

  const confirmDelete = (item: any) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await permanentlyDeleteSubmission(itemToDelete.id, itemToDelete.type);
      toast({
        title: "Item Deleted",
        description: `"${itemToDelete.name}" has been permanently deleted.`,
      });
      fetchArchives();
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

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
            <CardTitle>Archived Data</CardTitle>
            <CardDescription>
              View and manage archived datasets and submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Archived On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archives.length > 0 ? (
                  archives.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell><TypeBadge type={item.type} /></TableCell>
                      <TableCell>
                        <StatusBadge status={item.status || 'approved'} />
                      </TableCell>
                       <TableCell>
                        {new Date(item.archivedDate || item.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => confirmDelete(item)}
                          disabled={isDeleting && itemToDelete?.id === item.id}
                        >
                          {isDeleting && itemToDelete?.id === item.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete Permanently
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No archived data found.
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item &quot;{itemToDelete?.name}&quot; from the archives.
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
                "Confirm Permanent Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
