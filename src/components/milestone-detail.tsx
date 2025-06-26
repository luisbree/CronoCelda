'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import type { Milestone, Category } from '@/types';
import { FileIcon } from './file-icon';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Paperclip, Tag, X } from 'lucide-react';

interface MilestoneDetailProps {
  milestone: Milestone | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  categories: Category[];
  onMilestoneUpdate: (updatedMilestone: Milestone) => void;
}

export function MilestoneDetail({ milestone, isOpen, onOpenChange, categories, onMilestoneUpdate }: MilestoneDetailProps) {
  const [newTag, setNewTag] = React.useState('');

  const handleCategoryChange = (categoryId: string) => {
    const newCategory = categories.find(c => c.id === categoryId);
    if (newCategory && milestone) {
      onMilestoneUpdate({ ...milestone, category: newCategory });
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
      const updatedTags = [...(milestone.tags || []), newTag.trim()];
      onMilestoneUpdate({ ...milestone, tags: updatedTags });
      setNewTag('');
    }
  };
  
  const handleTagRemove = (tagToRemove: string) => {
    if (milestone) {
        const updatedTags = (milestone.tags || []).filter(tag => tag !== tagToRemove);
        onMilestoneUpdate({ ...milestone, tags: updatedTags });
    }
  };

  // Reset local state when dialog closes or milestone changes
  React.useEffect(() => {
    if (!isOpen) {
      setNewTag('');
    }
  }, [isOpen]);

  if (!milestone) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl pr-8">{milestone.name}</DialogTitle>
          <div className="flex items-center pt-2">
            <Select value={milestone.category.id} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-auto border-none shadow-none focus:ring-0 gap-2 h-auto p-0 text-sm font-medium text-muted-foreground hover:text-foreground focus:text-foreground">
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
        </DialogHeader>
        <div className="py-2 overflow-y-auto space-y-4 pr-2">
            <p className="text-sm text-foreground leading-relaxed">{milestone.description}</p>
            
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
                    className="h-9"
                 />
            </div>
        
            <Separator />
            <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-base"><Paperclip className="h-4 w-4" /> Archivos Adjuntos</h3>
                {milestone.associatedFiles.length > 0 ? (
                    <ul className="space-y-2">
                        {milestone.associatedFiles.map(file => (
                            <li key={file.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                                <div className="flex items-center gap-3">
                                    <FileIcon type={file.type} />
                                    <span className="text-sm font-medium">{file.name}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{file.size}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground italic">No hay archivos adjuntos para este hito.</p>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
