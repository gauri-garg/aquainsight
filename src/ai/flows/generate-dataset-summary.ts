'use server';

/**
 * @fileOverview An AI agent that generates a summary of a submitted dataset.
 *
 * - generateDatasetSummary - A function that handles the dataset summary generation process.
 * - GenerateDatasetSummaryInput - The input type for the generateDatasetSummary function.
 * - GenerateDatasetSummaryOutput - The return type for the generateDatasetSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDatasetSummaryInputSchema = z.object({
  datasetDescription: z
    .string()
    .describe('A detailed description of the dataset to be summarized.'),
  datasetSample: z
    .string()
    .describe('A representative sample of the dataset in CSV format.'),
});
export type GenerateDatasetSummaryInput = z.infer<typeof GenerateDatasetSummaryInputSchema>;

const GenerateDatasetSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the dataset.'),
  progress: z.string().describe('Short summary of the generation progress.')
});
export type GenerateDatasetSummaryOutput = z.infer<typeof GenerateDatasetSummaryOutputSchema>;

export async function generateDatasetSummary(input: GenerateDatasetSummaryInput): Promise<GenerateDatasetSummaryOutput> {
  return generateDatasetSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDatasetSummaryPrompt',
  input: {schema: GenerateDatasetSummaryInputSchema},
  output: {schema: GenerateDatasetSummaryOutputSchema},
  prompt: `You are an expert data analyst tasked with summarizing datasets for relevance and accuracy.

  Please provide a concise summary of the dataset based on the following description and sample.

  Description: {{{datasetDescription}}}
  Sample Data: {{{datasetSample}}}

  Ensure the summary highlights key aspects of the data and its potential use cases.
  `, safetySettings: [
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_ONLY_HIGH',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_ONLY_HIGH',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_LOW_AND_ABOVE',
    },
  ],
});

const generateDatasetSummaryFlow = ai.defineFlow(
  {
    name: 'generateDatasetSummaryFlow',
    inputSchema: GenerateDatasetSummaryInputSchema,
    outputSchema: GenerateDatasetSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output!,
      progress: 'Generated a draft summary of the dataset.'
    };
  }
);
