'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import type { Milestone } from '@/types';
import { FileIcon } from './file-icon';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Paperclip, Tag } from 'lucide-react';

interface MilestoneDetailProps {
  milestone: Milestone | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function MilestoneDetail({ milestone, isOpen, onOpenChange }: MilestoneDetailProps) {
  if (!milestone) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl pr-8">{milestone.name}</DialogTitle>
          <div className="flex items-center pt-2">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: milestone.category.color }}
            />
            <span className="text-sm font-medium text-muted-foreground">{milestone.category.name}</span>
          </div>
        </DialogHeader>
        <div className="py-2 overflow-y-auto space-y-4 pr-2">
            <p className="text-sm text-foreground leading-relaxed">{milestone.description}</p>
            {milestone.tags && milestone.tags.length > 0 && (
                 <div className="flex flex-wrap gap-2 items-center">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {milestone.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                 </div>
            )}
        
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
