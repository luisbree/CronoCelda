'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically tagging files based on their content using AI.
 *
 * - autoTagFiles - A function that takes file content and returns suggested tags.
 * - AutoTagFilesInput - The input type for the autoTagFiles function.
 * - AutoTagFilesOutput - The return type for the autoTagFiles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoTagFilesInputSchema = z.object({
  fileContent: z
    .string()
    .describe('The content of the file to be tagged.'),
});
export type AutoTagFilesInput = z.infer<typeof AutoTagFilesInputSchema>;

const AutoTagFilesOutputSchema = z.object({
  tags: z
    .array(z.string())
    .describe('An array of suggested tags for the file.'),
});
export type AutoTagFilesOutput = z.infer<typeof AutoTagFilesOutputSchema>;

export async function autoTagFiles(input: AutoTagFilesInput): Promise<AutoTagFilesOutput> {
  return autoTagFilesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoTagFilesPrompt',
  input: {schema: AutoTagFilesInputSchema},
  output: {schema: AutoTagFilesOutputSchema},
  prompt: `You are an expert at tagging files based on their content.

  Analyze the following file content and suggest relevant tags. The tags should be concise and descriptive.

  File Content: {{{fileContent}}}

  Return the tags as a JSON array of strings.`,
});

const autoTagFilesFlow = ai.defineFlow(
  {
    name: 'autoTagFilesFlow',
    inputSchema: AutoTagFilesInputSchema,
    outputSchema: AutoTagFilesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
