
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  matchEdnaSequence,
  type MatchEdnaSequenceOutput,
} from "@/ai/flows/edna-matching-assistant";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const ednaFormSchema = z.object({
  ednaSequence: z.string().min(10, {
    message: "eDNA sequence must be at least 10 characters long.",
  }),
});

type EdnaFormValues = z.infer<typeof ednaFormSchema>;

const EXAMPLE_SEQUENCE = "GATTACAAGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGatc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg-atc-gat-cga-tcg";

export default function EdnaMatchingPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const form = useForm<EdnaFormValues>({
    resolver: zodResolver(ednaFormSchema),
    defaultValues: {
      ednaSequence: EXAMPLE_SEQUENCE,
    },
    mode: "onChange",
  });

  async function onSubmit(data: EdnaFormValues) {
    setIsSubmitting(true);
    setResults(null);
    try {
      const response = await matchEdnaSequence({
        ednaSequence: data.ednaSequence,
        speciesDatabaseDescription:
          "A comprehensive database of marine species found in the Southern Ocean, including fish, mammals, and invertebrates.",
      });

      if (response && response.speciesMatches && response.confidenceScores) {
         const formattedResults = response.speciesMatches.map((species, index) => ({
            name: species,
            confidence: response.confidenceScores[index] * 100,
         }));
         setResults(formattedResults);
      }
      
      toast({
        title: "Matching Complete",
        description: `Found ${response.speciesMatches.length} potential species.`,
      });
    } catch (error: any) {
      toast({
        title: "Matching Failed",
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
            <CardTitle>eDNA Matching Assistant</CardTitle>
            <CardDescription>
              Enter an eDNA sequence to find potential species matches.
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
                  name="ednaSequence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>eDNA Sequence</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your eDNA sequence here..."
                          className="resize-y h-48 font-mono text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The AI will compare this against a known species database.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Match Sequence
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Matching Results</CardTitle>
            <CardDescription>
              Potential species matches and their confidence scores will appear
              here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitting ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">
                  Analyzing sequence...
                </p>
              </div>
            ) : results ? (
              results.length > 0 ? (
                <ChartContainer config={{}} className="h-[400px] w-full">
                    <ResponsiveContainer>
                        <BarChart layout="vertical" data={results} margin={{ left: 20, right: 40 }}>
                             <CartesianGrid horizontal={false} />
                             <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                             <YAxis dataKey="name" type="category" width={150} />
                             <Tooltip content={<ChartTooltipContent indicator="dot" />} cursor={{fill: 'hsl(var(--muted))'}} />
                             <Bar dataKey="confidence" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                                <LabelList 
                                    dataKey="confidence" 
                                    position="right" 
                                    formatter={(value: number) => `${value.toFixed(1)}%`}
                                    className="fill-foreground font-medium"
                                />
                             </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-48">
                  <p className="text-muted-foreground">
                    No matching species found for the provided sequence.
                  </p>
                </div>
              )
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
