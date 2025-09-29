
'use server';

/**
 * @fileOverview An AI agent that generates a summary of a submitted dataset.
 *
 * - generateDatasetSummary - A function that handles the dataset summary generation process.
 * - GenerateDatasetSummaryInput - The input type for the generateDatasetSummary function.
 * - GenerateDatasetSummaryOutput - The return type for the generateDatasetsummary function.
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
  summary: z.string().describe('A detailed, multi-paragraph summary of the dataset, explaining its purpose, the meaning of its columns, and potential insights. If it is species data, talk about distribution. If it is time-series, talk about trends.'),
});

export type GenerateDatasetSummaryOutput = z.infer<typeof GenerateDatasetSummaryOutputSchema>;

export async function generateDatasetSummary(input: GenerateDatasetSummaryInput): Promise<GenerateDatasetSummaryOutput> {
  return generateDatasetSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDatasetSummaryPrompt',
  input: {schema: GenerateDatasetSummaryInputSchema},
  output: {schema: GenerateDatasetSummaryOutputSchema},
  prompt: `You are an expert data analyst and storyteller. Your task is to provide a clear and comprehensive summary of a dataset.

  **Dataset Description:**
  {{{datasetDescription}}}

  **Data Sample (CSV):**
  \`\`\`csv
  {{{datasetSample}}}
  \`\`\`

  **Your Task:**
  Write a Narrative Summary: Write a detailed, multi-paragraph summary covering:
    *   **Overall Purpose:** What is this dataset about and what is its likely purpose?
    *   **Column Breakdown:** Describe what each column represents.
    *   **Potential Insights:** Mention any observable patterns or potential analyses. If it's species data, talk about distribution. If it's time-series, talk about trends.

  Produce the output in the required JSON format.
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
},
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const generateDatasetSummaryFlow = ai.defineFlow(
  {
    name: 'generateDatasetSummaryFlow',
    inputSchema: GenerateDatasetSummaryInputSchema,
    outputSchema: GenerateDatasetSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
