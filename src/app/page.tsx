'use client';

import * as React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Timeline } from '@/components/timeline';
import { MilestoneDetail } from '@/components/milestone-detail';
import { type Milestone, type Category, type AssociatedFile } from '@/types';
import { CATEGORIES } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { autoTagFiles } from '@/ai/flows/auto-tag-files';
import { addMonths, parseISO, subMonths, subYears } from 'date-fns';
import { TrelloSummary } from '@/components/trello-summary';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, GanttChartSquare } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getCardAttachments } from '@/services/trello';

const DEFAULT_CATEGORY_COLORS = ['#a3e635', '#22c55e', '#14b8a6', '#0ea5e9', '#4f46e5', '#8b5cf6', '#be185d', '#f97316', '#facc15'];

export default function Home() {
  const [milestones, setMilestones] = React.useState<Milestone[]>([]);
  const [categories, setCategories] = React.useState<Category[]>(CATEGORIES);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateRange, setDateRange] = React.useState<{ start: Date; end: Date } | null>(null);
  const [selectedMilestone, setSelectedMilestone] = React.useState<Milestone | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isTrelloOpen, setTrelloOpen] = React.useState(false);
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);
  const [isLoadingTimeline, setIsLoadingTimeline] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    if (milestones.length > 0) {
      const allDates = milestones.map(m => parseISO(m.occurredAt));
      const oldest = new Date(Math.min(...allDates.map(d => d.getTime())));
      const newest = new Date(Math.max(...allDates.map(d => d.getTime())));
      setDateRange({
        start: subMonths(oldest, 1),
        end: addMonths(newest, 1),
      });
    } else {
        setDateRange(null);
    }
  }, [milestones]);

  const handleCardSelect = async (cardId: string | null) => {
    setSelectedCardId(cardId);
    if (!cardId) {
      setMilestones([]);
      return;
    }

    setIsLoadingTimeline(true);
    setMilestones([]);

    try {
        const attachments = await getCardAttachments(cardId);
        const defaultCategory = categories[1] || CATEGORIES[1];

        const newMilestones: Milestone[] = attachments.map(att => {
            const fileType: AssociatedFile['type'] = 
                att.mimeType.startsWith('image/') ? 'image' : 
                att.mimeType.startsWith('video/') ? 'video' :
                att.mimeType.startsWith('audio/') ? 'audio' :
                ['application/pdf', 'application/msword', 'text/plain'].some(t => att.mimeType.includes(t)) ? 'document' : 'other';
            
            const associatedFile: AssociatedFile = {
                id: `file-${att.id}`,
                name: att.fileName,
                size: `${(att.bytes / 1024).toFixed(2)} KB`,
                type: fileType
            };

            return {
                id: `hito-${att.id}`,
                name: att.fileName,
                description: `Archivo adjuntado a la tarjeta de Trello el ${new Date(att.date).toLocaleDateString()}.`,
                occurredAt: att.date,
                category: defaultCategory,
                tags: null,
                associatedFiles: [associatedFile],
            };
        });

        setMilestones(newMilestones);
        
        newMilestones.forEach(async (milestone) => {
             try {
                if (milestone.name) {
                    const result = await autoTagFiles({ textToAnalyze: milestone.name });
                    setMilestones(prev =>
                      prev.map(m =>
                        m.id === milestone.id ? { ...m, tags: result.tags } : m
                      )
                    );
                }
             } catch (error) {
                console.error('AI tagging failed:', error);
                setMilestones(prev =>
                  prev.map(m =>
                    m.id === milestone.id ? { ...m, tags: [] } : m
                  )
                );
             }
        });

    } catch(error) {
        console.error("Failed to process card attachments:", error);
        toast({
            variant: "destructive",
            title: "Error al cargar hitos",
            description: "No se pudieron obtener los datos de la tarjeta de Trello."
        });
    } finally {
        setIsLoadingTimeline(false);
    }
  }


  const handleSetRange = (rangeType: '1M' | '1Y' | 'All') => {
    const now = new Date();
    if (rangeType === '1M') {
      setDateRange({ start: subMonths(now, 1), end: now });
    } else if (rangeType === '1Y') {
      setDateRange({ start: subYears(now, 1), end: now });
    } else {
      if (milestones.length > 0) {
        const allDates = milestones.map(m => parseISO(m.occurredAt));
        const oldest = new Date(Math.min(...allDates.map(d => d.getTime())));
        const newest = new Date(Math.max(...allDates.map(d => d.getTime())));
        setDateRange({
          start: subMonths(oldest, 1),
          end: addMonths(newest, 1),
        });
      }
    }
  };

  const handleMilestoneClick = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setIsDetailOpen(true);
  };

  const filteredMilestones = milestones
    .filter(milestone => {
      const term = searchTerm.toLowerCase();
      return (
        milestone.name.toLowerCase().includes(term) ||
        milestone.description.toLowerCase().includes(term) ||
        milestone.category.name.toLowerCase().includes(term) ||
        (milestone.tags && milestone.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    })
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  const handleCategoryColorChange = (categoryId: string, color: string) => {
    const newCategories = categories.map(c => 
      c.id === categoryId ? { ...c, color } : c
    );
    setCategories(newCategories);

    const newMilestones = milestones.map(m => {
      if (m.category.id === categoryId) {
        return { ...m, category: { ...m.category, color } };
      }
      return m;
    });
    setMilestones(newMilestones);
  };
  
  const handleCategoryAdd = (name: string) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      color: DEFAULT_CATEGORY_COLORS[categories.length % DEFAULT_CATEGORY_COLORS.length],
    };
    setCategories(prev => [...prev, newCategory]);
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar 
        categories={categories} 
        onCategoryColorChange={handleCategoryColorChange}
        onCategoryAdd={handleCategoryAdd}
        onCardSelect={handleCardSelect}
        selectedCardId={selectedCardId}
      />
      <div
        className="flex flex-1 flex-col transition-all duration-300"
      >
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSetRange={handleSetRange} />
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
        >
          {isLoadingTimeline ? (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-2xl font-semibold font-headline mt-4">Cargando línea de tiempo...</h2>
                <p className="mt-2 text-muted-foreground">
                    Obteniendo los hitos desde Trello.
                </p>
            </div>
          ) : dateRange && milestones.length > 0 ? (
             <Timeline 
                milestones={filteredMilestones} 
                startDate={dateRange.start}
                endDate={dateRange.end}
                onMilestoneClick={handleMilestoneClick}
              />
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <GanttChartSquare className="h-16 w-16 text-muted-foreground/50" />
                <h2 className="text-2xl font-semibold font-headline mt-4">Bienvenido a CronoCelda</h2>
                <p className="mt-2 text-muted-foreground max-w-md">
                  Para comenzar, utiliza los controles de la barra lateral para seleccionar un tablero, una lista y finalmente una tarjeta de Trello que represente tu proyecto.
                </p>
              </div>
          )}
        </main>
      </div>

      <MilestoneDetail
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        milestone={selectedMilestone}
      />

      <TrelloSummary
        isOpen={isTrelloOpen}
        onOpenChange={setTrelloOpen}
      />

      <div className="absolute bottom-6 right-6 z-20">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="rounded-full h-14 w-14 shadow-lg bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => setTrelloOpen(true)}
                aria-label="Abrir Resumen de Trello"
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Resumen de Trello con IA</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
