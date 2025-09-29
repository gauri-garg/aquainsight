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
  keyInsights: z.array(z.string()).describe('A list of 3-5 bullet-point insights or interesting facts discovered in the data sample.'),
  dataQualityIssues: z.array(z.string()).describe('A list of potential data quality issues, such as missing values or inconsistencies. If none, return an empty array.'),
  suggestedVisualizations: z.array(VisualizationSchema).describe('An array of 1-2 suggested visualizations based on the data. The AI should analyze columns to determine suitable chart types (e.g., categorical for pie/bar, time-series for line).')
});

export type GenerateDatasetSummaryOutput = z.infer<typeof GenerateDatasetSummaryOutputSchema>;

export async function generateDatasetSummary(input: GenerateDatasetSummaryInput): Promise<GenerateDatasetSummaryOutput> {
  return generateDatasetSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDatasetSummaryPrompt',
  input: {schema: GenerateDatasetSummaryInputSchema},
  output: {schema: GenerateDatasetSummaryOutputSchema},
  prompt: `You are an expert data analyst tasked with providing a comprehensive analysis of a dataset. Based on the provided description and CSV sample, generate a structured analysis.

  **Dataset Description:**
  {{{datasetDescription}}}

  **Data Sample (CSV):**
  \`\`\`csv
  {{{datasetSample}}}
  \`\`\`

  **Your Task:**
  1.  **Summarize the Dataset:** Write a single, concise paragraph that explains what the dataset is about.
  2.  **Identify Key Insights:** Extract 3 to 5 interesting, non-obvious insights from the data. These should be things a casual observer might miss.
  3.  **Assess Data Quality:** Point out any potential quality issues like missing values, inconsistent formatting, or outliers. If there are no obvious issues, return an empty array.
  4.  **Suggest Visualizations:** Propose 1 or 2 meaningful charts based on the data.
      *   Analyze the columns to choose an appropriate chart type. For categorical data (e.g., species, locations), suggest a 'pie' or 'bar' chart. For numerical data over time, suggest a 'line' chart.
      *   Provide a title, description, and the data formatted for a Recharts component (an array of objects).
      *   For bar/line charts, specify the xKey and yKey. For pie charts, use 'name' for the label and 'value' for the metric as the keys in the data array, and set xKey to 'name' and yKey to 'value'.
      *   Aggregate data if necessary. For example, if suggesting a pie chart for species distribution, count the occurrences of each species.
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
