'use server';

/**
 * @fileOverview A data integrity assessment AI agent.
 *
 * - assessDataIntegrity - A function that handles the data integrity assessment process.
 * - AssessDataIntegrityInput - The input type for the assessDataIntegrity function.
 * - AssessDataIntegrityOutput - The return type for the assessDataIntegrity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessDataIntegrityInputSchema = z.object({
  attendanceData: z
    .string()
    .describe('A string containing attendance records for employees.'),
});
export type AssessDataIntegrityInput = z.infer<typeof AssessDataIntegrityInputSchema>;

const AssessDataIntegrityOutputSchema = z.object({
  assessment: z
    .string()
    .describe(
      'An assessment of the coherence and accuracy of the attendance data, including any identified inconsistencies and suggested corrective measures.'
    ),
  isConsistent: z
    .boolean()
    .describe('A boolean indicating whether the attendance data is consistent.'),
});
export type AssessDataIntegrityOutput = z.infer<typeof AssessDataIntegrityOutputSchema>;

export async function assessDataIntegrity(input: AssessDataIntegrityInput): Promise<AssessDataIntegrityOutput> {
  return assessDataIntegrityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessDataIntegrityPrompt',
  input: {schema: AssessDataIntegrityInputSchema},
  output: {schema: AssessDataIntegrityOutputSchema},
  prompt: `You are an expert in data analysis and consistency checking.

You will receive attendance data for employees at a construction site. Your task is to assess the coherence and accuracy of this data.

Identify any potential inconsistencies, errors, or anomalies in the data. Provide a detailed assessment of the data's integrity, highlighting any discrepancies and suggesting corrective measures.

Based on your assessment, determine whether the data is consistent and set the isConsistent output field appropriately. If there are any inconsistencies in the attendance data, then isConsistent must be set to false.

Attendance Data:
{{{attendanceData}}}
`,
});

const assessDataIntegrityFlow = ai.defineFlow(
  {
    name: 'assessDataIntegrityFlow',
    inputSchema: AssessDataIntegrityInputSchema,
    outputSchema: AssessDataIntegrityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
