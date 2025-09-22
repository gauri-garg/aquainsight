
"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Bot } from "lucide-react";
import {
  generateDatasetSummary,
  GenerateDatasetSummaryOutput,
} from "@/ai/flows/generate-dataset-summary";
import { useToast } from "@/hooks/use-toast";
import { database } from "@/lib/firebase";
import { ref, push, set } from "firebase/database";
import { useAuth } from "@/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatasetType } from "@/lib/data";

const formSchema = z.object({
  datasetName: z.string().min(5, "Dataset name must be at least 5 characters."),
  datasetType: z.enum([
    "Physical Oceanography",
    "Chemical Oceanography",
    "Marine Weather",
    "Ocean Atmosphere",
    "Fisheries",
  ]),
  datasetDescription: z
    .string()
    .min(20, "Please provide a more detailed description."),
  file: z
    .instanceof(File, { message: "Dataset file is required." })
    .refine((file) => file.size > 0, "Dataset file is required.")
    .refine(
      (file) => file.type === "text/csv",
      "Only CSV files are allowed."
    ),
});

type FormData = z.infer<typeof formSchema>;

const datasetTypeToTableName = (type: DatasetType): string => {
  return type.toLowerCase().replace(/ /g, '_');
}

export default function DataSubmissionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<GenerateDatasetSummaryOutput | null>(
    null
  );
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      datasetName: "",
      datasetDescription: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setSummary(null);

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit a dataset.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const fileContent = await data.file.text();
      const rows = fileContent.split("\n");
      const recordCount = rows.length > 1 ? rows.length - 1 : 0;
      const sample = rows.slice(0, 10).join("\n");

      const aiSummary = await generateDatasetSummary({
        datasetDescription: data.datasetDescription,
        datasetSample: sample,
      });
      setSummary(aiSummary);

      const tableName = datasetTypeToTableName(data.datasetType);
      const datasetsRef = ref(database, tableName);
      const newDatasetRef = push(datasetsRef);

      await set(newDatasetRef, {
        id: newDatasetRef.key,
        name: data.datasetName,
        type: data.datasetType,
        submittedBy: user.email,
        status: "Pending",
        date: new Date().toISOString().split("T")[0],
        records: recordCount,
        description: data.datasetDescription,
        summary: aiSummary.summary,
      });

      toast({
        title: "Submission Successful",
        description: "Your dataset has been submitted for review.",
      });
      form.reset();
    } catch (e: any) {
      toast({
        title: "Submission Failed",
        description:
          e.message || "An error occurred during submission. Please try again.",
        variant: "destructive",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Submit New Dataset</CardTitle>
        <CardDescription>
          Upload your dataset in CSV format. An AI-powered summary will be
          generated for review.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="datasetName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dataset Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Antarctic Krill Survey 2024"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="datasetType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dataset Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a dataset type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Physical Oceanography">
                        Physical Oceanography
                      </SelectItem>
                      <SelectItem value="Chemical Oceanography">
                        Chemical Oceanography
                      </SelectItem>
                      <SelectItem value="Marine Weather">
                        Marine Weather
                      </SelectItem>
                      <SelectItem value="Ocean Atmosphere">
                        Ocean Atmosphere
                      </SelectItem>
                      <SelectItem value="Fisheries">Fisheries</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dataset File (CSV)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={(e) =>
                        field.onChange(
                          e.target.files ? e.target.files[0] : null
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Please upload your data in a comma-separated value format.
                    The first row should be the header.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="datasetDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dataset Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the dataset, including collection methods, parameters, and potential significance..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This description will help reviewers and the AI understand
                    your data.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {summary && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2 border">
                <h3 className="font-semibold flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-primary" /> AI-Generated
                  Summary
                </h3>
                <p className="text-sm text-muted-foreground">
                  {summary.summary}
                </p>
                <p className="text-xs text-muted-foreground pt-2">
                  Progress: {summary.progress}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting & Analyzing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit for Review
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
