'use server';

/**
 * @fileOverview Este archivo define un flujo de Genkit para etiquetar automáticamente archivos basados en su contenido usando IA.
 *
 * - autoTagFiles - Una función que toma el contenido de un archivo y devuelve etiquetas sugeridas.
 * - AutoTagFilesInput - El tipo de entrada para la función autoTagFiles.
 * - AutoTagFilesOutput - El tipo de retorno para la función autoTagFiles.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoTagFilesInputSchema = z.object({
  fileContent: z
    .string()
    .describe('El contenido del archivo a ser etiquetado.'),
});
export type AutoTagFilesInput = z.infer<typeof AutoTagFilesInputSchema>;

const AutoTagFilesOutputSchema = z.object({
  tags: z
    .array(z.string())
    .describe('Un array de etiquetas sugeridas para el archivo.'),
});
export type AutoTagFilesOutput = z.infer<typeof AutoTagFilesOutputSchema>;

export async function autoTagFiles(input: AutoTagFilesInput): Promise<AutoTagFilesOutput> {
  return autoTagFilesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoTagFilesPrompt',
  input: {schema: AutoTagFilesInputSchema},
  output: {schema: AutoTagFilesOutputSchema},
  prompt: `Eres un experto en etiquetar archivos basándote en su contenido.

  Analiza el siguiente contenido de archivo y sugiere etiquetas relevantes. Las etiquetas deben ser concisas y descriptivas.

  Contenido del Archivo: {{{fileContent}}}

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
