
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PlusCircle, MoreHorizontal, Loader2, Search } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, Dataset } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";

export default function DatasetsPage() {
  const { role, getAllDatasets, deleteDataset } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<Dataset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (role && role !== "CMLRE") {
      router.push("/dashboard");
    } else if (role) {
      const fetchDatasets = async () => {
        try {
          const fetchedDatasets = await getAllDatasets();
          setDatasets(fetchedDatasets);
        } catch (error: any) {
          toast({
            title: "Error fetching datasets",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchDatasets();
    }
  }, [role, router, getAllDatasets, toast]);

  const confirmDelete = (dataset: Dataset) => {
    setDatasetToDelete(dataset);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!datasetToDelete || !datasetToDelete.id) return;
    setIsDeleting(true);
    try {
      await deleteDataset(datasetToDelete.id);
      setDatasets(datasets.filter((d) => d.id !== datasetToDelete.id));
      toast({
        title: "Dataset Deleted",
        description: `"${datasetToDelete.name}" has been successfully deleted.`,
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
      setDatasetToDelete(null);
    }
  };

  const filteredDatasets = useMemo(() => {
    if (!searchTerm) return datasets;
    const lowercasedTerm = searchTerm.toLowerCase();
    return datasets.filter((dataset) => {
      return (
        dataset.name.toLowerCase().includes(lowercasedTerm) ||
        dataset.description.toLowerCase().includes(lowercasedTerm) ||
        dataset.submittedBy.toLowerCase().includes(lowercasedTerm) ||
        (dataset.csvData && dataset.csvData.toLowerCase().includes(lowercasedTerm))
      );
    });
  }, [datasets, searchTerm]);

  if (loading || (role && role !== "CMLRE")) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Datasets</h1>
        <div className="ml-auto flex items-center gap-2">
           <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search datasets..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button size="sm" className="h-8 gap-1" asChild>
            <Link href="/dashboard/datasets/new">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Dataset
              </span>
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Datasets</CardTitle>
          <CardDescription>
            Here you can view, add, edit, and delete datasets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">
                  Submitted by
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Date
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDatasets.length > 0 ? (
                filteredDatasets.map((dataset) => (
                  <TableRow key={dataset.id}>
                    <TableCell className="font-medium">{dataset.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Active</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {dataset.submittedBy}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(dataset.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onSelect={() => router.push(`/dashboard/datasets/${dataset.id}`)}
                          >
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => router.push(`/dashboard/datasets/${dataset.id}/edit`)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500 focus:bg-red-50"
                            onSelect={() => confirmDelete(dataset)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No datasets found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the dataset &quot;{datasetToDelete?.name}&quot;.
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
