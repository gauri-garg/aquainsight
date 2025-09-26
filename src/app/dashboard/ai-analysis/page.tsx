
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
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

  async function onSubmit(data: AnalysisFormValues) {
    setIsSubmitting(true);
    setResult(null);
    try {
      const selectedDataset = datasets.find((d) => d.id === data.datasetId);
      if (!selectedDataset) {
        throw new Error("Selected dataset not found.");
      }

      // Limit data sample to first 50 lines to keep the payload small
      const dataSample = selectedDataset.csvData.split("\n").slice(0, 50).join("\n");

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
      toast({
        title: "Analysis Failed",
        description:
          error.message || "An unexpected error occurred with the AI model.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Analysis</CardTitle>
            <CardDescription>
              Select a dataset to generate an automated summary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="datasetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dataset</FormLabel>
                      <Select
                        onValueChange={field.onChange}
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
                      <FormDescription>
                        The AI will analyze the selected dataset&apos;s
                        description and data.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Analyze Dataset
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
            <CardDescription>
              The AI-generated summary will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitting ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">
                  Generating summary...
                </p>
              </div>
            ) : result ? (
              <div className="prose prose-sm max-w-none text-card-foreground">
                <p>{result.summary}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48">
                <p className="text-muted-foreground">
                  Results will be displayed here after submission.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
