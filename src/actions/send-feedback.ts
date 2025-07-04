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
    console.error('ERROR: La API Key de Resend (RESEND_API_KEY) no está configurada. Revisa tu archivo .env.');
    return { success: false, message: 'El servicio de correo no está configurado. Contacta al administrador.' };
  }

  // Validar los datos también en el lado del servidor
  const validatedData = feedbackSchema.safeParse(data);
  if (!validatedData.success) {
      console.warn('Validación de feedback fallida en el servidor:', validatedData.error);
      return { success: false, message: 'Los datos enviados no son válidos.' };
  }

  const { userEmail, title, content } = validatedData.data;

  try {
    const resend = new Resend(apiKey);
    
    const { data: responseData, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // ¡IMPORTANTE! Para producción, cambia esto a un dominio verificado en tu cuenta de Resend.
      
      // --- CAMBIO PARA PRUEBAS ---
      // En el modo de prueba de Resend, solo puedes enviar correos A la misma dirección con la que te registraste.
      // Para que las pruebas funcionen, usaremos la dirección del formulario como destinatario.
      // Asegúrate de que el correo que usas para probar sea el mismo que usaste para crear tu cuenta en Resend.
      // Cuando verifiques tu dominio en Resend, cambia la siguiente línea a tu email de destino (ej: 'eiasambientales@gmail.com').
      to: userEmail,
      
      reply_to: userEmail,
      subject: `[DEAS TL: comentario] ${title}`,
      text: `Comentario de: ${userEmail}\n\n${content}`,
    });

    if (error) {
        // Log the detailed error from Resend for debugging purposes on the server.
        console.error('Error detallado de Resend al enviar el correo:', JSON.stringify(error, null, 2));
        
        let userMessage = 'No se pudo enviar el comentario. Por favor, inténtalo más tarde.';
        
        if (error.message && error.message.includes('You can only send testing emails to your own email address')) {
            userMessage = 'Error de Resend: Solo puedes enviar correos de prueba a tu propia dirección de email (la que usaste para registrarte en Resend).';
        } else if (error.name === 'authentication_error') {
            userMessage = 'Error de autenticación con Resend. Por favor, revisa que tu RESEND_API_KEY sea correcta.';
        } else if (error.name === 'validation_error') {
            userMessage = `Error de validación de Resend. Asegúrate de que el email de destino (${userEmail}) sea el mismo con el que te registraste en Resend.`;
        }

        return { success: false, message: userMessage };
    }

    console.log(`Correo de feedback enviado con éxito. ID de Resend: ${responseData?.id}`);
    return { success: true, message: '¡Comentario enviado con éxito!' };

  } catch (exception: any) {
    // This will catch any exceptions during the process, e.g., network errors or Resend SDK issues.
    console.error('Excepción al procesar el envío con Resend:', JSON.stringify(exception, null, 2));
    return { success: false, message: 'Ocurrió una excepción en el servidor al intentar enviar el correo.' };
  }
}
