
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BrainCircuit, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import {
  generateDatasetSummary,
  type GenerateDatasetSummaryOutput,
} from "@/ai/flows/generate-dataset-summary";
import { useAuth, Dataset } from "@/hooks/use-auth";

const analysisFormSchema = z.object({
  datasetId: z.string({
    required_error: "Please select a dataset to analyze.",
  }),
});

type AnalysisFormValues = z.infer<typeof analysisFormSchema>;


export default function AiAnalysisPage() {
  const { toast } = useToast();
  const { getAllDatasets } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [result, setResult] = useState<GenerateDatasetSummaryOutput | null>(
    null
  );
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const fetchedDatasets = await getAllDatasets();
        setDatasets(fetchedDatasets);
      } catch (error) {
        toast({
          title: "Error fetching datasets",
          description: "Could not load the list of available datasets.",
          variant: "destructive",
        });
      }
    };
    fetchDatasets();
  }, [getAllDatasets, toast]);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisFormSchema),
  });

  const handleDatasetChange = (datasetId: string) => {
    const findDataset = datasets.find(d => d.id === datasetId);
    setSelectedDataset(findDataset || null);
    form.setValue('datasetId', datasetId);
    setResult(null); // Clear previous results
  }

  async function onSubmit(data: AnalysisFormValues) {
    setIsSubmitting(true);
    setResult(null);
    if (!selectedDataset) {
        toast({ title: "Error", description: "Please select a dataset first.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    try {
      // Use a larger sample, up to 100 rows or ~4000 characters
      const sampleLines = selectedDataset.csvData.split("\n");
      let dataSample = sampleLines.slice(0, 101).join("\n"); // Header + 100 rows
      if (dataSample.length > 4000) {
        dataSample = dataSample.substring(0, 4000);
      }

      const response = await generateDatasetSummary({
        datasetDescription: selectedDataset.description,
        datasetSample: dataSample,
      });

      setResult(response);
      toast({
        title: "Analysis Complete",
        description: "The AI summary has been generated.",
      });
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      toast({
        title: "Analysis Failed",
        description:
          error.message || "An unexpected error occurred. The AI model may be unable to process this dataset.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const datasetHeaders = selectedDataset?.csvData.split('\n')[0].split(',') || [];
  const datasetSample = selectedDataset?.csvData.split('\n').slice(1, 6) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Analysis</CardTitle>
          <CardDescription>
            Select a dataset to generate an automated summary of its contents and potential insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col md:flex-row items-start gap-6"
            >
              <div className="w-full md:w-1/3">
                <FormField
                  control={form.control}
                  name="datasetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dataset</FormLabel>
                      <Select
                        onValueChange={handleDatasetChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a dataset..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {datasets.map((dataset) => (
                            <SelectItem key={dataset.id} value={dataset.id!}>
                              {dataset.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <Button type="submit" disabled={isSubmitting || !selectedDataset} className="mt-6 w-full md:w-auto">
                    {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Analyze Dataset
                </Button>
              </div>
               {selectedDataset && (
                <div className="w-full md:w-2/3 mt-6 md:mt-0">
                    <FormLabel>Dataset Preview (first 5 rows)</FormLabel>
                     <Card className="mt-2">
                        <CardContent className="p-0">
                             <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        {datasetHeaders.map(header => <TableHead key={header}>{header}</TableHead>)}
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {datasetSample.map((row, i) => (
                                        <TableRow key={i}>
                                        {row.split(',').map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                             </div>
                        </CardContent>
                    </Card>
                </div>
               )}
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isSubmitting && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">
                The AI is analyzing your data...
            </p>
             <p className="text-sm text-muted-foreground">This may take a moment.</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in-50">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        AI-Generated Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-card-foreground whitespace-pre-wrap">{result.summary}</p>
                </CardContent>
            </Card>
        </div>
      )}

      {!result && !isSubmitting && (
         <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center h-96">
            <BrainCircuit className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Ready to Analyze</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Select a dataset and click &quot;Analyze Dataset&quot; to see an AI-generated summary.
            </p>
        </div>
      )}
    </div>
  );
}
