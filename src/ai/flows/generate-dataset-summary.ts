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

const VisualizationSchema = z.object({
    chartType: z.enum(['bar', 'pie', 'line']).describe('The type of chart to render.'),
    title: z.string().describe('The title of the chart.'),
    description: z.string().describe('A short description of what the chart represents.'),
    data: z.array(z.record(z.any())).describe('The data for the chart, formatted for recharts.'),
    xKey: z.string().describe('The key for the x-axis in the data.'),
    yKey: z.string().describe('The key for the y-axis or value in the data.'),
});

const GenerateDatasetSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise, one-paragraph summary of the dataset.'),
  trends: z.array(z.string()).describe('A list of 2-3 bullet-point observations about the trends found in the data sample.'),
  dataQualityIssues: z.array(z.string()).describe('A list of potential data quality issues, such as missing values or inconsistencies. If none, return an empty array.'),
  suggestedVisualizations: z.array(VisualizationSchema).describe('An array of 1-2 suggested trend-based visualizations (line or bar charts) based on the data.')
});

export type GenerateDatasetSummaryOutput = z.infer<typeof GenerateDatasetSummaryOutputSchema>;

export async function generateDatasetSummary(input: GenerateDatasetSummaryInput): Promise<GenerateDatasetSummaryOutput> {
  return generateDatasetSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDatasetSummaryPrompt',
  input: {schema: GenerateDatasetSummaryInputSchema},
  output: {schema: GenerateDatasetSummaryOutputSchema},
  prompt: `You are an expert data storyteller tasked with providing a clear analysis of a dataset. Based on the provided description and CSV sample, generate a structured analysis.

  **Dataset Description:**
  {{{datasetDescription}}}

  **Data Sample (CSV):**
  \`\`\`csv
  {{{datasetSample}}}
  \`\`\`

  **Your Task:**
  1.  **Write a Narrative Summary:** Write a single, concise paragraph that explains what the dataset is about, as if you were telling a story.
  2.  **Identify Key Trends:** Extract 2 to 3 interesting, non-obvious trends from the data. Focus on changes over time or significant distributions.
  3.  **Assess Data Quality:** Point out any potential quality issues like missing values, inconsistent formatting, or outliers. If there are no obvious issues, return an empty array.
  4.  **Suggest Trend Visualizations:** Propose 1 or 2 meaningful charts that visualize the trends you identified.
      *   Prioritize 'line' charts for time-series data or 'bar' charts for categorical comparisons. Avoid pie charts unless it's for showing simple proportions.
      *   Provide a title, description, and the data formatted for a Recharts component (an array of objects).
      *   For bar/line charts, specify the xKey and yKey.
      *   Aggregate data if necessary to show a clear trend. For example, if suggesting a chart for species count, count the occurrences of each species.
      *   Ensure the generated data for the chart is directly usable.

  Produce the output in the required JSON format.
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
    return output!;
  }
);
