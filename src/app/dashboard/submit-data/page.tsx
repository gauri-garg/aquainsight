
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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";


const submissionFormSchema = z.object({
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

type SubmissionFormValues = z.infer<typeof submissionFormSchema>;

export default function SubmitDataPage() {
  const { toast } = useToast();
  const { user, userDetails, createRequestedDataset, role } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (role && role !== "User") {
      router.push("/dashboard");
    }
  }, [role, router]);

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionFormSchema),
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

  async function onSubmit(data: SubmissionFormValues) {
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

      const newRequestedDataset = {
        name: data.name,
        description: data.description,
        csvData: csvData,
        submittedBy: userDetails.fullName || user.email || "Unknown",
        date: new Date().toISOString(),
        userId: user.uid,
      };

      await createRequestedDataset(newRequestedDataset);

      toast({
        title: "Submission Successful!",
        description: "Your dataset has been sent for review.",
      });

      form.reset();
      router.push("/dashboard/my-submissions");

    } catch (error: any) {
       toast({
        title: "Submission Failed",
        description: error.message || "Could not process the file.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (role && role !== 'User') {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit a Dataset</CardTitle>
          <CardDescription>
            Fill out the form below to submit your dataset for review by CMLRE staff.
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
                      <Input placeholder="e.g., Krill Distribution Study 2024" {...field} />
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
                        placeholder="A detailed summary of what this dataset contains, including collection methods, location, and date range."
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
                      Upload the dataset in CSV or Excel format (.csv, .xls, .xlsx).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Dataset
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
