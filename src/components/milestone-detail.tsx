'use client';

import * as React from 'react';
import type { Milestone, Category, AssociatedFile } from '@/types';
import { FileIcon } from './file-icon';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Paperclip, Tag, X, Star, Pencil, History, UploadCloud, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
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
    <div className="flex flex-col h-full p-3 overflow-hidden text-foreground">
        <div className="flex items-start justify-between gap-2 shrink-0">
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
                    className="text-lg font-headline font-medium h-auto p-0 border-0 border-b-2 border-primary rounded-none focus-visible:ring-0 bg-transparent"
                    autoFocus
                />
                ) : (
                <h2 className="font-headline text-lg font-medium flex items-center gap-2 truncate">
                    <span className="truncate" title={milestone.name}>{milestone.name}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setIsEditingTitle(true)}>
                        <Pencil className="h-3 w-3" />
                    </Button>
                </h2>
                )}
                <div className="flex items-center pt-1.5">
                    <Select value={milestone.category.id} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-auto border-none shadow-none focus:ring-0 gap-2 h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground focus:text-foreground">
                            <SelectValue asChild>
                                <div className="flex items-center cursor-pointer">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full mr-2 shrink-0"
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
                 <div className="flex items-center text-xs text-muted-foreground mt-1.5">
                    <Clock className="h-3 w-3 mr-1.5" />
                    <span>{format(parseISO(milestone.occurredAt), "PPP 'a las' p", { locale: es })}</span>
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
        
        <Separator className="my-2 shrink-0" />
        
        <ScrollArea className="flex-1 -mr-3 pr-3">
            <div className="space-y-3">
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
                    className="text-xs leading-normal w-full bg-secondary/50"
                    autoFocus
                    rows={3}
                />
                ) : (
                <div
                    className="text-xs text-muted-foreground leading-normal cursor-pointer hover:bg-secondary/50 p-2 -m-2 rounded-md transition-colors relative group"
                    onClick={() => setIsEditingDescription(true)}
                >
                    <p className="whitespace-pre-wrap">{milestone.description || 'Añade una descripción...'}</p>
                    <Pencil className="h-3 w-3 absolute top-1 right-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                )}
                
                <div className="space-y-2">
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
                        className="h-8 bg-secondary/50 text-xs"
                    />
                </div>
            
                <Separator />

                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4" /> Archivos Adjuntos
                        </div>
                        <Button variant="outline" size="sm" className="h-7" onClick={() => fileInputRef.current?.click()}>
                            <UploadCloud className="mr-2 h-3 w-3"/>
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
                        <ul className="space-y-1.5">
                            {milestone.associatedFiles.map(file => (
                                <li key={file.id} className="flex items-center justify-between p-1.5 rounded-md bg-secondary/50">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <FileIcon type={file.type} />
                                        <span className="text-xs font-medium truncate" title={file.name}>{file.name}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground shrink-0">{file.size}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-muted-foreground italic">No hay archivos adjuntos para este hito.</p>
                    )}
                </div>
                
                <Separator />

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="history" className="border-b-0">
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline py-1">
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4" /> Historial de Cambios
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <ul className="space-y-1.5 text-xs text-muted-foreground pr-4 max-h-24 overflow-y-auto">
                            {milestone.history.slice().reverse().map((entry, index) => (
                                <li key={index}>{entry}</li>
                            ))}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </ScrollArea>
    </div>
  );
}
