'use server';

import { z } from 'zod';

const feedbackSchema = z.object({
  userEmail: z.string().email(),
  title: z.string().min(1),
  content: z.string().min(1),
});

type FeedbackData = z.infer<typeof feedbackSchema>;

/**
 * Sends feedback from the user.
 * 
 * In a production environment, you would integrate this with a real email
 * sending service like SendGrid, Resend, or Nodemailer using an API key
 * stored securely in environment variables.
 * 
 * @param data - The feedback data containing user email, title, and content.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function sendFeedback(data: FeedbackData) {
  try {
    // --- Integration with a real email service would go here ---
    // Example using a hypothetical email service:
    //
    // import { EmailService } from 'some-email-provider';
    // const emailService = new EmailService(process.env.EMAIL_API_KEY);
    //
    // await emailService.send({
    //   to: 'eiasambientales@gmail.com',
    //   from: 'noreply@deas-tl.com',
    //   reply_to: data.userEmail,
    //   subject: `[DEAS TL: comentario] ${data.title}`,
    //   text: `Comentario de: ${data.userEmail}\n\n${data.content}`,
    // });
    //
    // For now, we'll just log it to the server console to simulate the action.
    
    console.log('--- NUEVO COMENTARIO RECIBIDO ---');
    console.log('De:', data.userEmail);
    console.log('Título:', data.title);
    console.log('Contenido:', data.content);
    console.log('-------------------------------');

    // Simulate network delay for a more realistic user experience
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true, message: '¡Comentario enviado con éxito!' };
  } catch (error) {
    console.error('Error al intentar enviar feedback:', error);
    return { success: false, message: 'No se pudo enviar el comentario. Por favor, inténtalo más tarde.' };
  }
}
