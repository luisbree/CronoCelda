import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'CronoCelda',
  description: 'Tu repositorio de archivos personal en la nube con una línea de tiempo interactiva.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head />
      <body className="antialiased">
          {children}
          <Toaster />
      </body>
    </html>
  );
}
