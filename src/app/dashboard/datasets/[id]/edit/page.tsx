
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, Dataset } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
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
import { Loader2, ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";

const editDatasetFormSchema = z.object({
  name: z.string().min(3, {
    message: "Dataset name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  submittedBy: z.string().min(2, {
    message: "Submitter name must be at least 2 characters.",
  }),
  dataFile: z.any().optional(),
});

type EditDatasetFormValues = z.infer<typeof editDatasetFormSchema>;

export default function EditDatasetPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getDatasetById, updateDataset, userDetails, user, role } = useAuth();
  const { toast } = useToast();
  
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditDatasetFormValues>({
    resolver: zodResolver(editDatasetFormSchema),
    mode: "onChange",
  });
  const fileRef = form.register("dataFile");
  const dataFile = form.watch("dataFile");


  useEffect(() => {
    if (role && role !== "CMLRE") {
      router.push("/dashboard");
      return;
    }

    if (typeof id === "string") {
      const fetchDataset = async () => {
        setLoading(true);
        try {
          const fetchedDataset = await getDatasetById(id);
          if (fetchedDataset) {
            setDataset(fetchedDataset);
            form.reset({
              name: fetchedDataset.name,
              description: fetchedDataset.description,
              submittedBy: fetchedDataset.submittedBy,
            });
          } else {
            toast({
              title: "Not Found",
              description: "Dataset not found.",
              variant: "destructive",
            });
            router.push("/dashboard/datasets");
          }
        } catch (error) {
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
  }, [id, getDatasetById, form, router, toast, role]);

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

  async function onSubmit(data: EditDatasetFormValues) {
     if (!user || !userDetails || !dataset?.id) {
      toast({ title: "Authentication error", description: "You must be logged in.", variant: "destructive"});
      return;
    }

    setIsSubmitting(true);
    try {
      let csvData = dataset.csvData; // Keep old data by default
      const file = data.dataFile?.[0];

      if (file) {
         if (file.type === "text/csv") {
          csvData = await readFileAsText(file);
        } else if (["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(file.type)) {
          const arrayBuffer = await readFileAsArrayBuffer(file);
          const workbook = XLSX.read(arrayBuffer, { type: "buffer" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          csvData = XLSX.utils.sheet_to_csv(worksheet);
        } else {
            throw new Error("Invalid file type. Only .csv, .xls, or .xlsx files are accepted.")
        }
      }
      
      const updatedDataset = {
        name: data.name,
        description: data.description,
        csvData: csvData,
        submittedBy: data.submittedBy,
        date: new Date().toISOString(), // Update date on edit
      };

      await updateDataset(dataset.id, updatedDataset);
      
      toast({
        title: "Dataset Updated",
        description: "The dataset has been successfully updated.",
      });
      router.push("/dashboard/datasets");

    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not process the file.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (loading || (role && role !== 'CMLRE')) {
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
          <CardTitle>Edit Dataset</CardTitle>
          <CardDescription>
            Modify the details for &quot;{dataset?.name}&quot;.
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
                name="submittedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submitted by</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
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
                    <FormLabel>Update Dataset File (Optional)</FormLabel>
                    <FormControl>
                       <Input type="file" accept=".csv,.xls,.xlsx" {...fileRef} />
                    </FormControl>
                    {dataFile?.[0] && <p className="text-sm text-muted-foreground mt-2">Selected file: {dataFile[0].name}</p>}
                    <FormDescription>
                      Upload a new file to replace the existing data. If you leave this blank, the original data will be kept.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
