'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Category } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Textarea } from './ui/textarea';
import { UploadCloud } from 'lucide-react';

const uploadSchema = z.object({
  name: z.string().min(5, { message: 'El título del hito debe tener al menos 5 caracteres.' }),
  description: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres.' }),
  file: z.custom<File>(file => file instanceof File, 'Por favor, selecciona un archivo para subir.'),
  categoryId: z.string().min(1, 'Por favor, selecciona una categoría.'),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

interface FileUploadProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  categories: Category[];
  onUpload: (data: { file: File, categoryId: string, name: string, description: string }) => void;
  initialFile?: File | null;
}

export function FileUpload({
  isOpen,
  onOpenChange,
  categories,
  onUpload,
  initialFile,
}: FileUploadProps) {
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      name: '',
      description: '',
      file: undefined,
      categoryId: '',
    },
  });

  const fileRef = form.register("file");

  React.useEffect(() => {
    if (initialFile) {
      form.setValue('file', initialFile);
    }
    if (!isOpen) {
      form.reset();
    }
  }, [initialFile, form, isOpen]);

  const onSubmit = (data: UploadFormValues) => {
    onUpload(data);
  };
  
  const selectedFile = form.watch('file');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Crear un nuevo hito</DialogTitle>
          <DialogDescription>
            Añade un hito a tu CronoCelda. Describe el evento y adjunta el archivo principal.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Hito</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Inicio de Estudio de Impacto Ambiental" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el hito, su importancia y contexto."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Archivo Adjunto</FormLabel>
                  <FormControl>
                    <div className="relative">
                       <input id="file-input" type="file" className="hidden" {...fileRef} onChange={(e) => {
                          field.onChange(e.target.files ? e.target.files[0] : null);
                        }} />
                      <div 
                        className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center cursor-pointer hover:bg-accent hover:border-primary"
                        onClick={() => document.getElementById('file-input')?.click()}
                      >
                        <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                            {selectedFile ? selectedFile.name : 'Haz clic o arrastra un archivo'}
                        </p>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center">
                            <div
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creando...' : 'Crear Hito'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
