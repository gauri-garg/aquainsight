
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const datasetFormSchema = z.object({
  name: z.string().min(3, {
    message: "Dataset name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  dataFile: z
    .any()
    .refine((files) => files?.length == 1, "File is required.")
    .refine(
      (files) =>
        [
          "text/csv",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ].includes(files?.[0]?.type),
      "Only .csv, .xls, or .xlsx files are accepted."
    ),
});

type DatasetFormValues = z.infer<typeof datasetFormSchema>;

export default function NewDatasetPage() {
  const { user, userDetails, createDataset, role } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

   useEffect(() => {
    if (role && role !== "CMLRE") {
      router.push("/dashboard");
    }
  }, [role, router]);

  const form = useForm<DatasetFormValues>({
    resolver: zodResolver(datasetFormSchema),
    defaultValues: {
      name: "",
      description: "",
      dataFile: undefined,
    },
    mode: "onChange",
  });
  
  const fileRef = form.register("dataFile");

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as ArrayBuffer);
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  async function onSubmit(data: DatasetFormValues) {
    if (!user || !userDetails) {
      toast({ title: "Authentication error", description: "You must be logged in.", variant: "destructive"});
      return;
    }

    setIsSubmitting(true);
    try {
      const file = data.dataFile[0];
      let csvData: string;

      if (file.type === "text/csv") {
        csvData = await readFileAsText(file);
      } else {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const workbook = XLSX.read(arrayBuffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        csvData = XLSX.utils.sheet_to_csv(worksheet);
      }
      
      const newDataset = {
        name: data.name,
        description: data.description,
        csvData: csvData,
        submittedBy: userDetails.fullName || user.email || "Unknown",
        date: new Date().toISOString(),
        userId: user.uid,
      };

      await createDataset(newDataset);
      
      toast({
        title: "Dataset Created",
        description: "Your new dataset has been successfully created.",
      });
      router.push("/dashboard/datasets");
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Could not process the file.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (role && role !== 'CMLRE') {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
          <CardTitle>Create New Dataset</CardTitle>
          <CardDescription>
            Fill out the form below to add a new dataset to the platform.
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dataset Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Penguin Tracking Data 2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief summary of what this dataset contains."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="dataFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dataset File</FormLabel>
                    <FormControl>
                       <Input type="file" accept=".csv,.xls,.xlsx" {...fileRef} />
                    </FormControl>
                    <FormDescription>
                      Upload the dataset in CSV or Excel format (.xls, .xlsx).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Dataset
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
