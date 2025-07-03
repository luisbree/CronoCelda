'use client';

import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// IMPORTANTE: Reemplaza esta dirección de correo con la tuya.
const FEEDBACK_EMAIL = 'tu-correo-aqui@dominio.com';

export function FeedbackButton() {
  const mailtoLink = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
    'Feedback para la aplicación DEAS TL'
  )}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-teal-500 hover:bg-teal-600 text-white z-50"
          >
            <a href={mailtoLink}>
              <MessageSquare className="h-7 w-7" />
              <span className="sr-only">Enviar Feedback</span>
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Enviar feedback o reportar un error</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
