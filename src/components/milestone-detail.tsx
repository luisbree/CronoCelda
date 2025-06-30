'use client';

import * as React from 'react';
import type { Milestone, Category, AssociatedFile } from '@/types';
import { FileIcon } from './file-icon';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Paperclip, Tag, X, Star, Pencil, History, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from './ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';

interface MilestoneDetailProps {
  milestone: Milestone;
  categories: Category[];
  onMilestoneUpdate: (updatedMilestone: Milestone) => void;
  onClose: () => void;
}

export function MilestoneDetail({ milestone, categories, onMilestoneUpdate, onClose }: MilestoneDetailProps) {
  const [newTag, setNewTag] = React.useState('');
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [editableTitle, setEditableTitle] = React.useState('');
  const [isEditingDescription, setIsEditingDescription] = React.useState(false);
  const [editableDescription, setEditableDescription] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (milestone) {
      setEditableTitle(milestone.name);
      setEditableDescription(milestone.description);
      setNewTag('');
      setIsEditingTitle(false);
      setIsEditingDescription(false);
    }
  }, [milestone]);

  const createLogEntry = (action: string): string => {
    return `${format(new Date(), "PPpp", { locale: es })} - ${action}`;
  };

  const handleTitleSave = () => {
    if (milestone && editableTitle.trim() && editableTitle.trim() !== milestone.name) {
      const updatedMilestone = {
        ...milestone,
        name: editableTitle.trim(),
        history: [...milestone.history, createLogEntry(`Título cambiado a "${editableTitle.trim()}"`)],
      };
      onMilestoneUpdate(updatedMilestone);
    }
    setIsEditingTitle(false);
  };
  
  const handleDescriptionSave = () => {
    if (milestone && editableDescription.trim() !== milestone.description) {
        onMilestoneUpdate({
            ...milestone,
            description: editableDescription.trim(),
            history: [...milestone.history, createLogEntry('Descripción actualizada.')],
        });
    }
    setIsEditingDescription(false);
  };

  const handleCategoryChange = (categoryId: string) => {
    const newCategory = categories.find(c => c.id === categoryId);
    if (newCategory && milestone && newCategory.id !== milestone.category.id) {
      onMilestoneUpdate({
        ...milestone,
        category: newCategory,
        history: [...milestone.history, createLogEntry(`Categoría cambiada a "${newCategory.name}"`)],
      });
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim() !== '' && milestone) {
      e.preventDefault();
      // Avoid adding duplicate tags
      if (milestone.tags && milestone.tags.includes(newTag.trim())) {
        setNewTag('');
        return;
      }
      const newTagName = newTag.trim();
      const updatedTags = [...(milestone.tags || []), newTagName];
      onMilestoneUpdate({
        ...milestone,
        tags: updatedTags,
        history: [...milestone.history, createLogEntry(`Etiqueta añadida: "${newTagName}"`)],
      });
      setNewTag('');
    }
  };
  
  const handleTagRemove = (tagToRemove: string) => {
    if (milestone) {
        const updatedTags = (milestone.tags || []).filter(tag => tag !== tagToRemove);
        onMilestoneUpdate({
          ...milestone,
          tags: updatedTags,
          history: [...milestone.history, createLogEntry(`Etiqueta eliminada: "${tagToRemove}"`)],
        });
    }
  };

  const handleToggleImportant = () => {
    if (milestone) {
      const action = !milestone.isImportant ? 'marcado como importante' : 'desmarcado como importante';
      onMilestoneUpdate({
        ...milestone,
        isImportant: !milestone.isImportant,
        history: [...milestone.history, createLogEntry(`Hito ${action}`)],
      });
    }
  };

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !milestone) return;

    const newFiles = Array.from(e.target.files);
    
    const newAssociatedFiles: AssociatedFile[] = newFiles.map(file => {
      const fileType: AssociatedFile['type'] = 
          file.type.startsWith('image/') ? 'image' : 
          file.type.startsWith('video/') ? 'video' :
          file.type.startsWith('audio/') ? 'audio' :
          ['application/pdf', 'application/msword', 'text/plain'].some(t => file.type.includes(t)) ? 'document' : 'other';
      
      return {
          id: `file-local-${Date.now()}-${file.name}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          type: fileType
      };
    });

    if (newAssociatedFiles.length > 0) {
      onMilestoneUpdate({
        ...milestone,
        associatedFiles: [...milestone.associatedFiles, ...newAssociatedFiles],
        history: [...milestone.history, createLogEntry(`Se añadieron ${newAssociatedFiles.length} archivo(s)`)],
      });
    }
    // Reset file input
    if(e.target) e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden text-card-foreground">
        <div className="flex items-start justify-between gap-4 shrink-0">
            <div className="flex-1 min-w-0">
                {isEditingTitle ? (
                <Input
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    className="text-xl font-headline font-medium h-auto p-0 border-0 border-b-2 border-primary rounded-none focus-visible:ring-0 bg-transparent"
                    autoFocus
                />
                ) : (
                <h2 className="font-headline text-xl font-medium flex items-center gap-2 truncate">
                    <span className="truncate" title={milestone.name}>{milestone.name}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setIsEditingTitle(true)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                </h2>
                )}
                <div className="flex items-center pt-2">
                    <Select value={milestone.category.id} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-auto border-none shadow-none focus:ring-0 gap-2 h-auto p-0 text-sm font-medium text-muted-foreground hover:text-card-foreground focus:text-card-foreground">
                            <SelectValue asChild>
                                <div className="flex items-center cursor-pointer">
                                    <div
                                        className="w-3 h-3 rounded-full mr-2 shrink-0"
                                        style={{ backgroundColor: milestone.category.color }}
                                    />
                                    <span>{milestone.category.name}</span>
                                </div>
                            </SelectValue>
                        </SelectTrigger>
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
                </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <button 
                    onClick={handleToggleImportant} 
                    className="p-1 rounded-full text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                    aria-label={milestone.isImportant ? 'Quitar de importantes' : 'Marcar como importante'}
                >
                    <Star className={cn("h-5 w-5", milestone.isImportant && "fill-yellow-400 text-yellow-400")} />
                </button>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <X className="h-5 w-5" />
                </Button>
            </div>
        </div>
        
        <Separator className="my-3 shrink-0" />
        
        <ScrollArea className="flex-1 -mr-4 pr-4">
            <div className="space-y-4">
                {isEditingDescription ? (
                <Textarea
                    value={editableDescription}
                    onChange={(e) => setEditableDescription(e.target.value)}
                    onBlur={handleDescriptionSave}
                    onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        setIsEditingDescription(false);
                        setEditableDescription(milestone.description);
                    }
                    }}
                    className="text-sm leading-relaxed w-full bg-transparent"
                    autoFocus
                    rows={5}
                />
                ) : (
                <div
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer hover:bg-secondary/50 p-2 -m-2 rounded-md transition-colors relative group"
                    onClick={() => setIsEditingDescription(true)}
                >
                    <p className="whitespace-pre-wrap">{milestone.description || 'Añade una descripción...'}</p>
                    <Pencil className="h-4 w-4 absolute top-2 right-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                )}
                
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 items-center">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        {(milestone.tags || []).map(tag => (
                            <Badge key={tag} variant="secondary" className="group/badge relative pl-2.5 pr-1 py-0.5 text-xs">
                                {tag}
                                <button 
                                    onClick={() => handleTagRemove(tag)} 
                                    className="ml-1 rounded-full opacity-50 group-hover/badge:opacity-100 hover:bg-destructive/20 p-0.5 transition-opacity"
                                    aria-label={`Quitar etiqueta ${tag}`}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                    <Input 
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={handleTagAdd}
                        placeholder="Añadir etiqueta y presionar Enter..."
                        className="h-9 bg-secondary/50"
                    />
                </div>
            
                <Separator />

                <div className="space-y-3">
                    <h3 className="font-semibold flex items-center justify-between gap-2 text-base">
                        <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4" /> Archivos Adjuntos
                        </div>
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <UploadCloud className="mr-2 h-4 w-4"/>
                            Añadir
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            multiple
                            onChange={handleFileAdd}
                        />
                    </h3>
                    {milestone.associatedFiles.length > 0 ? (
                        <ul className="space-y-2">
                            {milestone.associatedFiles.map(file => (
                                <li key={file.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FileIcon type={file.type} />
                                        <span className="text-sm font-medium truncate" title={file.name}>{file.name}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground shrink-0">{file.size}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No hay archivos adjuntos para este hito.</p>
                    )}
                </div>
                
                <Separator />

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="history" className="border-b-0">
                        <AccordionTrigger className="text-base font-semibold hover:no-underline py-2">
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4" /> Historial de Cambios
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                        <ScrollArea className="h-32">
                            <ul className="space-y-2 text-xs text-muted-foreground pr-4">
                            {milestone.history.slice().reverse().map((entry, index) => (
                                <li key={index}>{entry}</li>
                            ))}
                            </ul>
                        </ScrollArea>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </ScrollArea>
    </div>
  );
}
