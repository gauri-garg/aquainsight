
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
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";


const analysisFormSchema = z.object({
  datasetId: z.string({
    required_error: "Please select a dataset to analyze.",
  }),
});

type AnalysisFormValues = z.infer<typeof analysisFormSchema>;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DynamicChart = ({ viz }: { viz: NonNullable<GenerateDatasetSummaryOutput['visualizations']>[0] }) => {
    try {
        const data = JSON.parse(viz.data);
        if (!data || data.length === 0) return <p className="text-muted-foreground">No data for this chart.</p>;

        const keys = Object.keys(data[0]);
        const categoryKey = keys.find(k => typeof data[0][k] === 'string');
        const valueKey = keys.find(k => typeof data[0][k] === 'number');

        if (!categoryKey || !valueKey) return <p className="text-muted-foreground">Could not determine chart keys.</p>;

        return (
          <Card>
            <CardHeader>
              <CardTitle>{viz.title}</CardTitle>
              <CardDescription>{viz.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[400px] w-full">
                <ResponsiveContainer>
                  {viz.chartType === 'bar' && (
                    <BarChart data={data} layout="vertical" margin={{ left: 120 }}>
                      <CartesianGrid horizontal={false} />
                      <YAxis dataKey={categoryKey} type="category" width={150}/>
                      <XAxis type="number" />
                      <Tooltip content={<ChartTooltipContent indicator="dot" />} cursor={{ fill: 'hsl(var(--muted))' }} />
                      <Bar dataKey={valueKey} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                         <LabelList 
                            dataKey={valueKey}
                            position="right"
                            className="fill-foreground font-medium"
                        />
                      </Bar>
                    </BarChart>
                  )}
                  {viz.chartType === 'line' && (
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={categoryKey} />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                      <Legend />
                      <Line type="monotone" dataKey={valueKey} stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                    </LineChart>
                  )}
                  {viz.chartType === 'pie' && (
                    <PieChart>
                      <Pie data={data} dataKey={valueKey} nameKey={categoryKey} cx="50%" cy="50%" outerRadius={120} label>
                        {data.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        );

    } catch (e) {
        console.error("Chart rendering error:", e);
        return <p className="text-destructive">Could not render chart. Invalid data format.</p>
    }
}

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
        description: "The AI summary and visualizations have been generated.",
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
            Select a dataset to generate an automated summary and visualizations.
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

            {result.visualizations && result.visualizations.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {result.visualizations.map((viz, index) => (
                        <DynamicChart key={index} viz={viz} />
                    ))}
                </div>
            )}
        </div>
      )}

      {!result && !isSubmitting && (
         <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center h-96">
            <BrainCircuit className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Ready to Analyze</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Select a dataset and click &quot;Analyze Dataset&quot; to see an AI-generated summary and visualizations.
            </p>
        </div>
      )}
    </div>
  );
}
