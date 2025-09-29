
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
import { Loader2, BarChart, LineChart } from "lucide-react";
import { useState, useEffect } from "react";
import {
  generateDatasetSummary,
  type GenerateDatasetSummaryOutput,
} from "@/ai/flows/generate-dataset-summary";
import { useAuth, Dataset } from "@/hooks/use-auth";
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from "recharts";
import { BarChart as BarChartRe, LineChart as LineChartRe } from "recharts";

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
      const dataSample = selectedDataset.csvData.split("\n").slice(0, 100).join("\n");

      const response = await generateDatasetSummary({
        datasetDescription: selectedDataset.description,
        datasetSample: dataSample,
      });

      setResult(response);
      toast({
        title: "Analysis Complete",
        description: "The AI summary and visualizations have been generated.",
      });
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description:
          error.message || "An unexpected error occurred with the AI model. The model might not be able to process this dataset's format.",
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
            Select a dataset to generate an automated summary and trend visualizations.
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
                    <CardTitle>AI Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-card-foreground">{result.summary}</p>
                </CardContent>
            </Card>

            {result.suggestedVisualizations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Trend Visualizations</CardTitle>
                        <CardDescription>The AI has generated the following charts based on the data sample to illustrate key trends.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
                        {result.suggestedVisualizations.map((vis, i) => (
                            <Card key={i} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {vis.chartType === 'bar' && <BarChart className="h-5 w-5 text-primary" />}
                                        {vis.chartType === 'line' && <LineChart className="h-5 w-5 text-primary" />}
                                        {vis.title}
                                    </CardTitle>
                                    <CardDescription>{vis.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                     <ResponsiveContainer width="100%" height={300}>
                                        {vis.chartType === 'bar' && (
                                            <BarChartRe data={vis.data}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey={vis.xKey} />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey={vis.yKey} fill="hsl(var(--chart-1))" />
                                            </BarChartRe>
                                        )}
                                        {vis.chartType === 'line' && (
                                             <LineChartRe data={vis.data}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey={vis.xKey} />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey={vis.yKey} stroke="hsl(var(--chart-1))" />
                                            </LineChartRe>
                                        )}
                                     </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
      )}

      {!result && !isSubmitting && (
         <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center h-96">
            <BarChart className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Ready to Analyze</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Select a dataset and click &quot;Analyze Dataset&quot; to see AI-generated insights.
            </p>
        </div>
      )}
    </div>
  );
}
