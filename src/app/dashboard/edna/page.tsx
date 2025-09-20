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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Dna, Loader2, Microscope, Percent } from "lucide-react";
import {
  matchEdnaSequence,
  MatchEdnaSequenceOutput,
} from "@/ai/flows/edna-matching-assistant";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  ednaSequence: z
    .string()
    .min(10, "eDNA sequence must be at least 10 characters long."),
  speciesDatabaseDescription: z
    .string()
    .min(10, "Database description is required."),
});

type FormData = z.infer<typeof formSchema>;

export default function EdanMatchingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MatchEdnaSequenceOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ednaSequence: "AAGTCGTAACAAGGTTTCCGTAGGTGAACCTGCGGAAGGATCATTA",
      speciesDatabaseDescription:
        "A comprehensive database of Antarctic marine species, including fish, krill, and various microorganisms. The database contains genetic markers from the COI and 18S rRNA genes.",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setResults(null);
    try {
      const response = await matchEdnaSequence(data);
      setResults(response);
    } catch (e: any) {
      toast({
        title: "Matching Failed",
        description:
          e.message ||
          "An error occurred while matching the sequence. Please try again.",
        variant: "destructive",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>eDNA Species Matching</CardTitle>
          <CardDescription>
            Enter an eDNA sequence and a database description to find potential
            species matches.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="ednaSequence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>eDNA Sequence</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter eDNA sequence here..."
                        className="min-h-[100px] font-mono text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="speciesDatabaseDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Species Database Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the database..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Matching...
                  </>
                ) : (
                  <>
                    <Dna className="mr-2 h-4 w-4" />
                    Match Sequence
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matching Results</CardTitle>
          <CardDescription>
            Potential species matches and their confidence scores.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">
                Analyzing sequence...
              </p>
            </div>
          )}
          {results && (
            <div className="space-y-4">
              {results.speciesMatches.map((species, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium flex items-center">
                      <Microscope className="mr-2 h-4 w-4 text-muted-foreground" />
                      {species}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      {results.confidenceScores[index].toFixed(2)}%{" "}
                      <Percent className="ml-1 h-3 w-3" />
                    </p>
                  </div>
                  <Progress value={results.confidenceScores[index]} className="h-2" />
                </div>
              ))}
            </div>
          )}
          {!isLoading && !results && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Dna className="h-12 w-12 mb-4" />
              <p>
                Results will appear here once you submit a sequence.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
