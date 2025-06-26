'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Milestone } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Star } from 'lucide-react';
import { Separator } from './ui/separator';

interface MilestoneSummarySheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  milestones: Milestone[];
}

export function MilestoneSummarySheet({
  isOpen,
  onOpenChange,
  milestones,
}: MilestoneSummarySheetProps) {

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">Resumen de Hitos</SheetTitle>
          <SheetDescription>
            Una lista de todos los hitos visibles en la línea de tiempo, ordenados por fecha.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4 pr-4">
          <div className="space-y-4">
            {milestones.length > 0 ? (
              milestones.map((milestone, index) => (
                <div key={milestone.id}>
                    <div className="flex flex-col items-start gap-2">
                      <div className="flex w-full justify-between items-start">
                        <p className="font-semibold text-base">{milestone.name}</p>
                        {milestone.isImportant && (
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(milestone.occurredAt), "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: milestone.category.color }}
                        />
                        <span className="text-sm">{milestone.category.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {milestone.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {index < milestones.length -1 && <Separator className="mt-4"/>}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay hitos para mostrar.
              </p>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
