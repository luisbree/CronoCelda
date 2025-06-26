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
import { FileUpload } from '@/components/file-upload';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, type User } from 'firebase/auth';

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
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [driveUser, setDriveUser] = React.useState<User | null>(null);

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

  const handleCardSelect = React.useCallback(async (cardId: string | null) => {
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
  }, [categories, toast]);

  const handleUpload = async (data: { file: File, categoryId: string, name: string, description: string }) => {
    const { file, categoryId, name, description } = data;
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
        toast({
            variant: "destructive",
            title: "Error al crear hito",
            description: "La categoría seleccionada no es válida.",
        });
        return;
    };

    const fileType: AssociatedFile['type'] = 
        file.type.startsWith('image/') ? 'image' : 
        file.type.startsWith('video/') ? 'video' :
        file.type.startsWith('audio/') ? 'audio' :
        ['application/pdf', 'application/msword', 'text/plain'].some(t => file.type.includes(t)) ? 'document' : 'other';
    
    const associatedFile: AssociatedFile = {
        id: `file-local-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        type: fileType
    };

    const newMilestone: Milestone = {
        id: `hito-local-${Date.now()}`,
        name: name,
        description: description,
        occurredAt: new Date().toISOString(), // Use current time for new milestones
        category: category,
        tags: null, // Start with null to show loading spinner
        associatedFiles: [associatedFile],
    };

    setMilestones(prev => [...prev, newMilestone]);
    setIsUploadOpen(false);
    toast({
        title: "Hito creado",
        description: "El nuevo hito ha sido añadido a la línea de tiempo.",
    });

    // Run AI tagging in the background
    try {
        const result = await autoTagFiles({ textToAnalyze: `${name} ${description}` });
        setMilestones(prev =>
          prev.map(m =>
            m.id === newMilestone.id ? { ...m, tags: result.tags } : m
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
  };


  const handleSetRange = React.useCallback((rangeType: '1M' | '1Y' | 'All') => {
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
  }, [milestones]);

  const handleMilestoneClick = React.useCallback((milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setIsDetailOpen(true);
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

  const handleDriveConnect = async () => {
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Configuración Incompleta',
        description: 'Las credenciales de Firebase no están configuradas. Por favor, completa tu archivo .env para usar esta función.',
      });
      return;
    }
    
    if (driveUser) {
        console.log("Already connected to Drive with user:", driveUser.displayName);
        toast({ title: "Ya estás conectado a Google Drive." });
        return;
    }

    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.readonly');
    
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        setDriveUser(user);
        toast({
            title: "Conexión Exitosa",
            description: `Conectado como ${user.displayName}.`,
        });

    } catch (error: any) {
        console.error("Google Sign-In Error:", error);
        
        let description = "No se pudo conectar con Google Drive. Por favor, revisa la consola para más detalles.";
        if (error.code === 'auth/configuration-not-found') {
          description = "La configuración de Firebase no es correcta. Asegúrate de que los valores en tu archivo .env coinciden con los de tu proyecto de Firebase.";
        }

        toast({
            variant: "destructive",
            title: "Error de conexión",
            description: description,
        });
    }
  };

  const handleMilestoneUpdate = React.useCallback((updatedMilestone: Milestone) => {
    setMilestones(prevMilestones =>
      prevMilestones.map(m =>
        m.id === updatedMilestone.id ? { ...m, ...updatedMilestone } : m
      )
    );
    // Also update the selected milestone if it's the one being edited
    if (selectedMilestone && selectedMilestone.id === updatedMilestone.id) {
        setSelectedMilestone(updatedMilestone);
    }
  }, [selectedMilestone]);


  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar 
        categories={categories} 
        onCategoryColorChange={handleCategoryColorChange}
        onCategoryAdd={handleCategoryAdd}
        onCardSelect={handleCardSelect}
        selectedCardId={selectedCardId}
        onNewMilestoneClick={() => setIsUploadOpen(true)}
        onDriveConnect={handleDriveConnect}
        isDriveConnected={!!driveUser}
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
        categories={categories}
        onMilestoneUpdate={handleMilestoneUpdate}
      />

      <FileUpload
        isOpen={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        categories={categories}
        onUpload={handleUpload}
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
