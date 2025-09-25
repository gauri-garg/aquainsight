
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, Dataset } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DatasetViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getDatasetById, role } = useAuth();
  const { toast } = useToast();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role && role !== "CMLRE") {
      router.push("/dashboard");
      return;
    }

    if (id && typeof id === "string") {
      const fetchDataset = async () => {
        try {
          const fetchedDataset = await getDatasetById(id);
          if (fetchedDataset) {
            setDataset(fetchedDataset);
          } else {
            toast({
              title: "Not Found",
              description: "Dataset not found.",
              variant: "destructive",
            });
            router.push("/dashboard/datasets");
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: "Failed to fetch dataset.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchDataset();
    }
  }, [id, getDatasetById, router, toast, role]);

  const parsedCsv = useMemo(() => {
    if (!dataset?.csvData) return { headers: [], rows: [] };
    const lines = dataset.csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
    return { headers, rows };
  }, [dataset]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dataset) {
    return null; // Or a not-found component
  }

  return (
    <div className="space-y-6">
       <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/datasets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Datasets
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>{dataset.name}</CardTitle>
              <CardDescription>{dataset.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm">
                <div>
                    <span className="font-semibold">Submitted by: </span>
                    <span>{dataset.submittedBy}</span>
                </div>
                 <div>
                    <span className="font-semibold">Date Submitted: </span>
                    <span>{new Date(dataset.date).toLocaleDateString()}</span>
                </div>
                 <div>
                    <span className="font-semibold">Status: </span>
                    <Badge variant="outline">Active</Badge>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>CSV Data Preview</CardTitle>
            <CardDescription>A preview of the first 100 rows from the uploaded CSV file.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    {parsedCsv.headers.map((header, index) => (
                        <TableHead key={index}>{header}</TableHead>
                    ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {parsedCsv.rows.slice(0, 100).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                        ))}
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
             {parsedCsv.rows.length > 100 && (
                <p className="text-sm text-muted-foreground mt-4">
                    ... and {parsedCsv.rows.length - 100} more rows.
                </p>
            )}
            {parsedCsv.rows.length === 0 && (
                 <p className="text-sm text-muted-foreground mt-4">
                    No data to preview. The file might be empty or formatted incorrectly.
                </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

