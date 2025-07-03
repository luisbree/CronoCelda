'use client';

import * as React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Timeline } from '@/components/timeline';
import { MilestoneDetail } from '@/components/milestone-detail';
import { type Milestone, type Category, type AssociatedFile } from '@/types';
import { CATEGORIES } from '@/lib/data';
import { toast } from '@/hooks/use-toast';
import { autoTagFiles } from '@/ai/flows/auto-tag-files';
import { addMonths, endOfDay, parseISO, startOfDay, subMonths, subYears, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getCardAttachments, type TrelloCardBasic } from '@/services/trello';
import { FileUpload } from '@/components/file-upload';
import { MilestoneSummarySheet } from '@/components/milestone-summary-sheet';
import { WelcomeScreen } from '@/components/welcome-screen';
import { RSB002_MILESTONES } from '@/lib/rsb002-data';
import { RSA060_MILESTONES } from '@/lib/rsa060-data';

const DEFAULT_CATEGORY_COLORS = ['#a3e635', '#22c55e', '#14b8a6', '#0ea5e9', '#4f46e5', '#8b5cf6', '#be185d', '#f97316', '#facc15'];

export default function Home() {
  const [milestones, setMilestones] = React.useState<Milestone[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateRange, setDateRange] = React.useState<{ start: Date; end: Date } | null>(null);
  const [selectedMilestone, setSelectedMilestone] = React.useState<Milestone | null>(null);
  const [selectedCard, setSelectedCard] = React.useState<TrelloCardBasic | null>(null);
  const [isLoadingTimeline, setIsLoadingTimeline] = React.useState(false);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Resizing state
  const [isResizing, setIsResizing] = React.useState(false);
  const [timelinePanelHeight, setTimelinePanelHeight] = React.useState(40); // Initial percentage
  const resizeContainerRef = React.useRef<HTMLDivElement>(null);
  const milestoneDateBounds = React.useRef<{start: string; end: string} | null>(null);

  const runAITagging = async (milestonesToTag: Milestone[]) => {
    const taggingPayload = milestonesToTag
      .filter(m => m.name)
      .map(m => ({
        id: m.id,
        textToAnalyze: `${m.name} ${m.description}`,
      }));
  
    if (taggingPayload.length === 0) {
      return;
    }
  
    try {
      const results = await autoTagFiles(taggingPayload);
      
      const tagsMap = new Map(results.map(r => [r.id, r.tags]));
  
      setMilestones(prev =>
        prev.map(m => {
          if (tagsMap.has(m.id)) {
            return { ...m, tags: tagsMap.get(m.id) ?? [] };
          }
          if (taggingPayload.some(p => p.id === m.id)) {
            return { ...m, tags: [] };
          }
          return m;
        })
      );
    } catch (error) {
      console.error('AI batch tagging failed:', error);
      const processedIds = new Set(taggingPayload.map(p => p.id));
      setMilestones(prev =>
        prev.map(m =>
          processedIds.has(m.id) ? { ...m, tags: [] } : m
        )
      );
    }
  };

  // Load state from localStorage on initial mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedCategories = localStorage.getItem('deas-tl-categories');
        const parsedCategories: Category[] | null = storedCategories ? JSON.parse(storedCategories) : null;
        
        let finalCategories: Category[];

        if (parsedCategories) {
          // We have saved categories. Let's merge them with the defaults to get new additions.
          const defaultCategoriesMap = new Map(CATEGORIES.map(c => [c.id, c]));
          const parsedCategoriesMap = new Map(parsedCategories.map(c => [c.id, c]));

          // Start with the default categories, but update them with any user changes (like color)
          const mergedBaseCategories = CATEGORIES.map(defaultCat => {
            return parsedCategoriesMap.get(defaultCat.id) || defaultCat;
          });

          // Now, add any truly custom categories the user created themselves
          const customUserCategories = parsedCategories.filter(parsedCat => !defaultCategoriesMap.has(parsedCat.id));

          finalCategories = [...mergedBaseCategories, ...customUserCategories];

        } else {
          // No saved data, just use the defaults from the code.
          finalCategories = [...CATEGORIES];
        }
        
        // Final cleanup: remove the old hardcoded 'cat-rsb002' if it somehow slipped in
        finalCategories = finalCategories.filter(c => c.id !== 'cat-rsb002');
        
        setCategories(finalCategories);

      } catch (error) {
          console.error("Failed to load or merge categories from localStorage", error);
          setCategories(CATEGORIES);
      } finally {
        // Milestones always start empty to ensure a clean slate.
        setMilestones([]);
        setIsLoaded(true);
      }
    }
  }, []); // Empty dependency array ensures this runs once on mount.

  // Save milestones to localStorage whenever they change
  React.useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('deas-tl-milestones', JSON.stringify(milestones));
    }
  }, [milestones, isLoaded]);

  // Save categories to localStorage whenever they change
  React.useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('deas-tl-categories', JSON.stringify(categories));
    }
  }, [categories, isLoaded]);


  React.useEffect(() => {
    if (milestones.length > 0) {
      const allDates = milestones.map(m => parseISO(m.occurredAt));
      const oldest = new Date(Math.min(...allDates.map(d => d.getTime())));
      const newest = new Date(Math.max(...allDates.map(d => d.getTime())));

      const newBounds = { start: oldest.toISOString(), end: newest.toISOString() };

      const hasBoundsChanged = newBounds.start !== milestoneDateBounds.current?.start || newBounds.end !== milestoneDateBounds.current?.end;
      
      if (hasBoundsChanged || !dateRange) {
        milestoneDateBounds.current = newBounds;
        setDateRange({
          start: subMonths(oldest, 1),
          end: addMonths(newest, 1),
        });
      }
    } else {
        milestoneDateBounds.current = null;
        setDateRange(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestones]);

  const handleCardSelect = React.useCallback(async (card: TrelloCardBasic | null) => {
    setSelectedCard(card);
    setSelectedMilestone(null); // Always close detail panel when changing card
    
    // Case 1: No card is selected. Clear everything and show welcome screen.
    if (!card) {
      setMilestones([]);
      setIsLoadingTimeline(false);
      return;
    }

    const cardNameLower = card.name.toLowerCase();

    // Case 2: A special local data card is selected (RSB002 or RSA060).
    const isRsb002Card = cardNameLower.includes('rsb002');
    const isRsa060Card = cardNameLower.includes('rsa060');
    
    if (isRsb002Card || isRsa060Card) {
        setIsLoadingTimeline(true);
        const localMilestones = isRsb002Card ? RSB002_MILESTONES : RSA060_MILESTONES;

        const categoriesMap = new Map(categories.map(c => [c.id, c]));

        // Map the hardcoded milestones to use the up-to-date category object from the main state
        const milestonesWithCategory = localMilestones.map(m => {
          const freshCategory = categoriesMap.get(m.category.id) || m.category;
          return {
            ...m,
            category: freshCategory,
          };
        });
        
        setMilestones(milestonesWithCategory);
        
        // Run AI tagging in the background
        runAITagging(milestonesWithCategory);

        setIsLoadingTimeline(false);
        return;
    }
    
    // Case 3: Any other Trello card is selected.
    setIsLoadingTimeline(true);
    try {
        const attachments = await getCardAttachments(card.id);
        const defaultCategory = categories.find(c => c.name.toLowerCase().includes('trello')) || CATEGORIES[1];

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
            
            const creationLog = `${format(new Date(), "PPpp", { locale: es })} - Creación desde Trello.`;

            return {
                id: `hito-${att.id}`,
                name: att.fileName,
                description: `Archivo adjuntado a la tarjeta de Trello el ${new Date(att.date).toLocaleDateString()}.`,
                occurredAt: att.date,
                category: defaultCategory,
                tags: null,
                associatedFiles: [associatedFile],
                isImportant: false,
                history: [creationLog],
            };
        });

        setMilestones(newMilestones);
        
        runAITagging(newMilestones);

    } catch(error) {
        console.error("Failed to process card attachments:", error);
        setMilestones([]); // Clear milestones on error
        toast({
            variant: "destructive",
            title: "Error al cargar hitos",
            description: "No se pudieron obtener los datos de la tarjeta de Trello."
        });
    } finally {
        setIsLoadingTimeline(false);
    }
  }, [categories]);

  const handleUpload = React.useCallback(async (data: { files?: File[], categoryId: string, name: string, description: string, occurredAt: Date }) => {
    const { files, categoryId, name, description, occurredAt } = data;
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
        toast({
            variant: "destructive",
            title: "Error al crear hito",
            description: "La categoría seleccionada no es válida.",
        });
        return;
    };

    const associatedFiles: AssociatedFile[] = [];
    if (files && files.length > 0) {
      files.forEach(file => {
        const fileType: AssociatedFile['type'] = 
            file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' :
            file.type.startsWith('audio/') ? 'audio' :
            ['application/pdf', 'application/msword', 'text/plain'].some(t => file.type.includes(t)) ? 'document' : 'other';
        
        const associatedFile: AssociatedFile = {
            id: `file-local-${Date.now()}-${file.name}`,
            name: file.name,
            size: `${(file.size / 1024).toFixed(2)} KB`,
            type: fileType
        };
        associatedFiles.push(associatedFile);
      });
    }

    const creationLog = `${format(new Date(), "PPpp", { locale: es })} - Creación de hito.`;
    const newMilestone: Milestone = {
        id: `hito-local-${Date.now()}`,
        name: name,
        description: description,
        occurredAt: occurredAt.toISOString(),
        category: category,
        tags: null, // Start with null to show loading spinner
        associatedFiles: associatedFiles,
        isImportant: false,
        history: [creationLog],
    };

    setMilestones(prev => [...prev, newMilestone]);
    setIsUploadOpen(false);
    toast({
        title: "Hito creado",
        description: "El nuevo hito ha sido añadido a la línea de tiempo.",
    });

    // Run AI tagging in the background
    try {
        const payload = [{
            id: newMilestone.id,
            textToAnalyze: `${name} ${description}`
        }];
        const results = await autoTagFiles(payload);
        const newTags = results.find(r => r.id === newMilestone.id)?.tags ?? [];

        setMilestones(prev =>
          prev.map(m =>
            m.id === newMilestone.id ? { ...m, tags: newTags } : m
          )
        );
    } catch (error) {
        console.error('AI tagging failed:', error);
        setMilestones(prev =>
          prev.map(m =>
            m.id === newMilestone.id ? { ...m, tags: [] } : m // Set to empty array to stop spinner
          )
        );
    }
  }, [categories]);


  const handleSetRange = React.useCallback((rangeType: '1D' | '1M' | '1Y' | 'All') => {
    const now = new Date();
    if (rangeType === '1D') {
      setDateRange({ start: startOfDay(now), end: endOfDay(now) });
    } else if (rangeType === '1M') {
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
  }, [milestones]);

  const handleMilestoneClick = React.useCallback((milestone: Milestone) => {
    setSelectedMilestone(milestone);
  }, []);

  const handleDetailClose = React.useCallback(() => {
    setSelectedMilestone(null);
  }, []);
  
  const handleGoHome = React.useCallback(() => {
    setMilestones([]);
    setSelectedCard(null);
    setSelectedMilestone(null);
    setSearchTerm('');
  }, []);

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

  const handleCategoryColorChange = React.useCallback((categoryId: string, color: string) => {
    setCategories(prevCategories => {
        const newCategories = prevCategories.map(c => 
          c.id === categoryId ? { ...c, color } : c
        );
        
        setMilestones(prevMilestones => prevMilestones.map(m => {
          if (m.category.id === categoryId) {
            const newCategory = newCategories.find(c => c.id === categoryId);
            if (newCategory) {
              return { ...m, category: newCategory };
            }
          }
          return m;
        }));

        return newCategories;
    });
  }, []);
  
  const handleCategoryAdd = React.useCallback((name: string) => {
    setCategories(prev => {
        const newCategory: Category = {
          id: `cat-${Date.now()}`,
          name,
          color: DEFAULT_CATEGORY_COLORS[prev.length % DEFAULT_CATEGORY_COLORS.length],
        };
        return [...prev, newCategory];
    });
  }, []);

  const handleCategoryUpdate = React.useCallback((categoryId: string, name: string) => {
    const newName = name.trim();
    if (!newName) return;

    setCategories(prev => {
      const newCategories = prev.map(c => 
        c.id === categoryId ? { ...c, name: newName } : c
      );
      
      // Also update milestones using this category
      setMilestones(prevMilestones => prevMilestones.map(m => {
        if (m.category.id === categoryId) {
          const newCategory = newCategories.find(c => c.id === categoryId);
          if (newCategory) {
            return { ...m, category: newCategory };
          }
        }
        return m;
      }));

      return newCategories;
    });
  }, []);
  
  const handleCategoryDelete = React.useCallback((categoryId: string) => {
    const isCategoryInUse = milestones.some(m => m.category.id === categoryId);

    if (isCategoryInUse) {
      toast({
        variant: "destructive",
        title: "Categoría en uso",
        description: "No se puede eliminar una categoría que está asignada a uno o más hitos.",
      });
      return;
    }

    setCategories(prev => prev.filter(c => c.id !== categoryId));
  }, [milestones]);

  const handleMilestoneUpdate = React.useCallback((updatedMilestone: Milestone) => {
    setMilestones(prevMilestones =>
      prevMilestones.map(m =>
        m.id === updatedMilestone.id ? updatedMilestone : m
      )
    );
    // Also update the selected milestone if it's the one being edited
    if (selectedMilestone && selectedMilestone.id === updatedMilestone.id) {
        setSelectedMilestone(updatedMilestone);
    }
  }, [selectedMilestone]);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };
  
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeContainerRef.current) return;
      
      const container = resizeContainerRef.current;
      const rect = container.getBoundingClientRect();
      const newHeight = e.clientY - rect.top;
      let newHeightPercent = (newHeight / rect.height) * 100;

      if (newHeightPercent < 20) newHeightPercent = 20;
      if (newHeightPercent > 80) newHeightPercent = 80;
      
      setTimelinePanelHeight(newHeightPercent);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);


  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar 
        categories={categories} 
        onCategoryColorChange={handleCategoryColorChange}
        onCategoryAdd={handleCategoryAdd}
        onCategoryUpdate={handleCategoryUpdate}
        onCategoryDelete={handleCategoryDelete}
        onCardSelect={handleCardSelect}
        selectedCard={selectedCard}
        onNewMilestoneClick={() => setIsUploadOpen(true)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          onSetRange={handleSetRange}
          onOpenSummary={() => setIsSummaryOpen(true)}
          onGoHome={handleGoHome}
          trelloCardUrl={selectedCard?.url ?? null}
        />
        <div 
          ref={resizeContainerRef}
          className="flex-1 flex flex-col overflow-hidden"
        >
            <main 
              className="overflow-y-auto p-4 md:p-6"
              style={{ height: selectedMilestone ? `${timelinePanelHeight}%` : '100%' }}
            >
            {isLoadingTimeline ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h2 className="text-2xl font-medium font-headline mt-4">Cargando línea de tiempo...</h2>
                    <p className="mt-2 text-muted-foreground">
                        Obteniendo los hitos desde Trello.
                    </p>
                </div>
            ) : milestones.length > 0 && dateRange ? (
                <div className="h-full w-full">
                    <Timeline 
                        milestones={filteredMilestones} 
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onMilestoneClick={handleMilestoneClick}
                    />
                </div>
            ) : (
                <WelcomeScreen />
            )}
            </main>
            {selectedMilestone && (
                 <>
                    <div
                      onMouseDown={handleResizeMouseDown}
                      className="h-2 bg-border cursor-row-resize hover:bg-ring transition-colors flex-shrink-0"
                      title="Arrastrar para redimensionar"
                    />
                    <div className="flex-1 bg-background shrink-0 overflow-y-auto light-panel">
                        <MilestoneDetail
                            milestone={selectedMilestone}
                            categories={categories}
                            onMilestoneUpdate={handleMilestoneUpdate}
                            onClose={handleDetailClose}
                        />
                    </div>
                 </>
            )}
        </div>
      </div>

      <FileUpload
        isOpen={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        categories={categories}
        onUpload={handleUpload}
      />
      
      <MilestoneSummarySheet
        isOpen={isSummaryOpen}
        onOpenChange={setIsSummaryOpen}
        milestones={filteredMilestones}
      />

    </div>
  );
}
