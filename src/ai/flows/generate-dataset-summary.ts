
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
  summary: z.string().describe('A detailed, multi-paragraph summary of the dataset, explaining its purpose, the meaning of its columns, and potential insights.'),
  visualizations: z.array(z.object({
      title: z.string().describe('The title of the chart.'),
      chartType: z.enum(['bar', 'line', 'pie']).describe('The type of chart to render.'),
      description: z.string().describe('A brief description of what the chart shows.'),
      data: z.string().describe('The data for the chart, formatted as a JSON string.'),
    })).optional().describe('A list of suggested visualizations based on the data.'),
});

export type GenerateDatasetSummaryOutput = z.infer<typeof GenerateDatasetSummaryOutputSchema>;

export async function generateDatasetSummary(input: GenerateDatasetSummaryInput): Promise<GenerateDatasetSummaryOutput> {
  return generateDatasetSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDatasetSummaryPrompt',
  input: {schema: GenerateDatasetSummaryInputSchema},
  output: {schema: GenerateDatasetSummaryOutputSchema},
  prompt: `You are an expert data analyst and storyteller. Your task is to provide a clear and comprehensive summary of a dataset and suggest visualizations to represent the data.

  **Dataset Description:**
  {{{datasetDescription}}}

  **Data Sample (CSV):**
  \`\`\`csv
  {{{datasetSample}}}
  \`\`\`

  **Your Task:**
  1.  **Write a Narrative Summary:** Write a detailed, multi-paragraph summary covering:
      *   **Overall Purpose:** What is this dataset about and what is its likely purpose?
      *   **Column Breakdown:** Describe what each column represents.
      *   **Potential Insights:** Mention any observable patterns or potential analyses. If it's species data, talk about distribution. If it's time-series, talk about trends.

  2.  **Suggest Visualizations:** Based on the data, suggest 1-2 relevant chart visualizations.
      *   For categorical data (like species counts), suggest a 'bar' or 'pie' chart.
      *   For time-series data (with a date column), suggest a 'line' chart.
      *   Provide a title, a brief description, and the data formatted as a JSON string.
      *   The JSON data should be an array of objects, with keys matching the data columns (e.g., \`[{ "species_name": "Penguin", "count": 150 }]\` or \`[{ "date": "2023-01-01", "temperature": -1.5 }]\`).

  Produce the output in the required JSON format.
  `, safetySettings: [
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
