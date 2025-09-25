
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, Dataset } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";

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

  const handleDownloadXlsx = () => {
    if (!dataset?.csvData) {
        toast({
            title: "No Data",
            description: "There is no data to download.",
            variant: "destructive"
        });
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
        toast({
            title: "Download Error",
            description: "Failed to create the XLSX file.",
            variant: "destructive"
        });
    }
  };

  const handleDownloadCsv = () => {
    if (!dataset?.csvData) {
      toast({
        title: 'No Data',
        description: 'There is no data to download.',
        variant: 'destructive',
      });
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
      toast({
        title: 'Download Error',
        description: 'Failed to create the CSV file.',
        variant: 'destructive',
      });
    }
  };


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
            <div className="flex flex-wrap items-center gap-4 text-sm">
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
            <div className="border-t pt-4 flex items-center gap-2">
                 <Button onClick={handleDownloadXlsx}>
                    <Download className="mr-2 h-4 w-4" />
                    Download as XLSX
                </Button>
                 <Button onClick={handleDownloadCsv} variant="secondary">
                    <Download className="mr-2 h-4 w-4" />
                    Download as CSV
                </Button>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>About this dataset</CardTitle>
            <CardDescription>
                This card provides context and metadata about the dataset file.
                The uploaded CSV data can be downloaded for analysis.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                Click one of the download buttons above to get the full dataset in your preferred format. This allows for offline analysis, sharing, and integration with other tools.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
