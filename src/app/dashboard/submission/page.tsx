
"use client";

import React, { useState, useTransition } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { firestore, storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatasetType } from "@/lib/data";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  datasetName: z.string().min(5, "Dataset name must be at least 5 characters."),
  datasetType: z.enum([
    "Physical Oceanography",
    "Chemical Oceanography",
    "Marine Weather",
    "Ocean Atmosphere",
    "eDNA",
    "Fisheries"
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


export default function DataSubmissionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { user, userDetails } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      datasetName: "",
      datasetDescription: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setUploadProgress(0);

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
      // 1. Upload CSV to Firebase Storage
      const storageRef = ref(storage, `submissions/${user.uid}/${Date.now()}-${data.file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, data.file);

      // Wrap upload task in a promise to handle async logic correctly
      const fileUrl = await new Promise<string>((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Upload failed:", error);
            toast({
              title: "Upload Failed",
              description: "An error occurred during the file upload. Please try again.",
              variant: "destructive",
            });
            setIsLoading(false);
            reject(error);
          },
          async () => {
            // Upload completed successfully, now get the download URL
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });

      // 2. Store metadata in Firestore
      await addDoc(collection(firestore, "submissions"), {
        studentId: user.uid,
        studentName: userDetails?.fullName || user.email,
        datasetName: data.datasetName,
        datasetType: data.datasetType,
        description: data.datasetDescription,
        status: "pending",
        fileUrl: fileUrl,
        submittedAt: serverTimestamp(),
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
        setUploadProgress(0);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Submit New Dataset</CardTitle>
        <CardDescription>
          Upload your dataset in CSV format for review by CMLRE staff.
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
                      disabled={isLoading}
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
                    disabled={isLoading}
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
                      <SelectItem value="eDNA">eDNA</SelectItem>
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
                      disabled={isLoading}
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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    This description will help reviewers understand your data.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             {isLoading && (
              <div className="space-y-2">
                <Label>Upload Progress</Label>
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground text-center">{Math.round(uploadProgress)}%</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting ({Math.round(uploadProgress)}%)...
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
