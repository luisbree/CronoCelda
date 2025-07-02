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
import { UploadCloud, X, File as FileIconLucide, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const uploadSchema = z.object({
  name: z.string().min(5, { message: 'El título del hito debe tener al menos 5 caracteres.' }),
  description: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres.' }),
  occurredAt: z.date({
    required_error: "Se requiere una fecha para el hito.",
  }),
  files: z.array(z.instanceof(File)).optional(),
  categoryId: z.string().min(1, 'Por favor, selecciona una categoría.'),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

interface FileUploadProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  categories: Category[];
  onUpload: (data: { files?: File[], categoryId: string, name: string, description: string, occurredAt: Date }) => void;
}

export function FileUpload({
  isOpen,
  onOpenChange,
  categories,
  onUpload,
}: FileUploadProps) {
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      name: '',
      description: '',
      files: [],
      categoryId: '',
      occurredAt: new Date(),
    },
  });

  React.useEffect(() => {
    if (!isOpen) {
      form.reset();
      form.setValue('occurredAt', new Date());
    }
  }, [form, isOpen]);

  const onSubmit = (data: UploadFormValues) => {
    onUpload(data);
  };
  
  const selectedFiles = form.watch('files') || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files ? Array.from(e.target.files) : [];
    if (newFiles.length === 0) return;
    
    const currentFiles = form.getValues('files') || [];
    form.setValue('files', [...currentFiles, ...newFiles], { shouldValidate: true });
    // Reset the input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const currentFiles = form.getValues('files') || [];
    const updatedFiles = currentFiles.filter((_, index) => index !== indexToRemove);
    form.setValue('files', updatedFiles, { shouldValidate: true });
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-zinc-800/90 backdrop-blur-sm text-card-foreground">
        <DialogHeader>
          <DialogTitle className="font-headline">Crear un nuevo hito</DialogTitle>
          <DialogDescription>
            Añade un hito a tu DEAS TL. Describe el evento y, si lo deseas, adjunta uno o más archivos.
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
                    <Input placeholder="Ej: Inicio de Estudio de Impacto Ambiental" {...field} className="bg-zinc-200 text-black border-zinc-300 placeholder:text-zinc-500" />
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
                      className="resize-none bg-zinc-200 text-black border-zinc-300 placeholder:text-zinc-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="occurredAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha del Hito</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-zinc-200 text-black border-zinc-300 hover:bg-zinc-300",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="files"
              render={() => (
                <FormItem>
                  <FormLabel>Archivos Adjuntos (Opcional)</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div 
                        className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center cursor-pointer hover:bg-accent/50 hover:border-primary"
                        onClick={() => document.getElementById('file-input')?.click()}
                      >
                        <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                            Haz clic para seleccionar archivos
                        </p>
                         <input id="file-input" type="file" className="hidden" multiple onChange={handleFileChange} />
                      </div>
                      {selectedFiles.length > 0 && (
                        <div className="space-y-1">
                          <ul className="max-h-32 overflow-y-auto space-y-2 rounded-md border border-black/20 p-2 bg-black/20">
                            {selectedFiles.map((file, index) => (
                              <li key={index} className="flex items-center justify-between text-sm p-1.5 bg-secondary/50 rounded-md">
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileIconLucide className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  <span className="truncate flex-1" title={file.name}>{file.name}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(index)}
                                  className="p-1 rounded-full hover:bg-destructive/10 text-destructive shrink-0"
                                  aria-label={`Quitar ${file.name}`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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
                      <SelectTrigger className="bg-zinc-200 text-black border-zinc-300">
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-zinc-200 text-black border-zinc-300 hover:bg-zinc-300">
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
