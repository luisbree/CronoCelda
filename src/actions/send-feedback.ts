'use server';

import { Resend } from 'resend';
import { z } from 'zod';

// Este esquema debe coincidir con el del componente del cliente para mantener la coherencia.
const feedbackSchema = z.object({
  userEmail: z.string().email({ message: 'Por favor, introduce un correo válido.' }),
  title: z.string().min(5, { message: 'El título debe tener al menos 5 caracteres.' }),
  content: z.string().min(10, { message: 'El comentario debe tener al menos 10 caracteres.' }),
});

type FeedbackData = z.infer<typeof feedbackSchema>;

/**
 * Envía los comentarios del usuario utilizando el servicio de correo electrónico Resend.
 *
 * @param data - Los datos del feedback que contienen el correo del usuario, el título y el contenido.
 * @returns Una promesa que se resuelve en un objeto que indica el éxito o el fracaso.
 */
export async function sendFeedback(data: FeedbackData) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('La API Key de Resend no está configurada. Revisa tu archivo .env.');
    return { success: false, message: 'El servicio de correo no está configurado. Contacta al administrador.' };
  }

  // Validar los datos también en el lado del servidor
  const validatedData = feedbackSchema.safeParse(data);
  if (!validatedData.success) {
      return { success: false, message: 'Los datos enviados no son válidos.' };
  }

  const { userEmail, title, content } = validatedData.data;

  try {
    const resend = new Resend(apiKey);
    
    await resend.emails.send({
      from: 'onboarding@resend.dev', // ¡IMPORTANTE! Para producción, cambia esto a un dominio verificado en tu cuenta de Resend.
      to: 'eiasambientales@gmail.com',
      reply_to: userEmail,
      subject: `[DEAS TL: comentario] ${title}`,
      text: `Comentario de: ${userEmail}\n\n${content}`,
    });

    return { success: true, message: '¡Comentario enviado con éxito!' };
  } catch (error) {
    console.error('Error al enviar el correo con Resend:', error);
    return { success: false, message: 'No se pudo enviar el comentario. Por favor, inténtalo más tarde.' };
  }
}
