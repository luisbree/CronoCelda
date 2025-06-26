'use server';

/**
 * @fileOverview Este archivo define un flujo de Genkit para etiquetar automáticamente contenido de texto usando IA.
 *
 * - autoTagFiles - Una función que toma un texto y devuelve etiquetas sugeridas.
 * - AutoTagFilesInput - El tipo de entrada para la función autoTagFiles.
 * - AutoTagFilesOutput - El tipo de retorno para la función autoTagFiles.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoTagFilesInputSchema = z.object({
  textToAnalyze: z
    .string()
    .describe('El texto a analizar para generar etiquetas.'),
});
export type AutoTagFilesInput = z.infer<typeof AutoTagFilesInputSchema>;

const AutoTagFilesOutputSchema = z.object({
  tags: z
    .array(z.string())
    .describe('Un array de etiquetas sugeridas para el texto.'),
});
export type AutoTagFilesOutput = z.infer<typeof AutoTagFilesOutputSchema>;

export async function autoTagFiles(input: AutoTagFilesInput): Promise<AutoTagFilesOutput> {
  return autoTagFilesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoTagFilesPrompt',
  input: {schema: AutoTagFilesInputSchema},
  output: {schema: AutoTagFilesOutputSchema},
  prompt: `Eres un experto en etiquetar documentos técnicos y administrativos relacionados a obras de ingeniería y medio ambiente.

  Analiza la siguiente descripción de un hito o evento y sugiere entre 3 y 5 etiquetas relevantes. Las etiquetas deben ser concisas, en minúsculas y descriptivas.

  Texto a analizar: {{{textToAnalyze}}}

  Devuelve las etiquetas como un array JSON de strings.`,
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
