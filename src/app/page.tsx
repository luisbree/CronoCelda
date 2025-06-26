'use client';

import * as React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Timeline } from '@/components/timeline';
import { FileUpload } from '@/components/file-upload';
import { MilestoneDetail } from '@/components/milestone-detail';
import { type Milestone, type Category, type AssociatedFile } from '@/types';
import { MILESTONES, CATEGORIES } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { autoTagFiles } from '@/ai/flows/auto-tag-files';
import { addMonths, parseISO, subMonths, subYears } from 'date-fns';

const DEFAULT_CATEGORY_COLORS = ['#a3e635', '#22c55e', '#14b8a6', '#0ea5e9', '#4f46e5', '#8b5cf6', '#be185d', '#f97316', '#facc15'];

export default function Home() {
  const [milestones, setMilestones] = React.useState<Milestone[]>(MILESTONES);
  const [categories, setCategories] = React.useState<Category[]>(CATEGORIES);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploadOpen, setUploadOpen] = React.useState(false);
  const [fileToUpload, setFileToUpload] = React.useState<File | null>(null);
  const [dateRange, setDateRange] = React.useState<{ start: Date; end: Date } | null>(null);
  const [selectedMilestone, setSelectedMilestone] = React.useState<Milestone | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

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
    }
  }, []);

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

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setFileToUpload(file);
      setUploadOpen(true);
      e.dataTransfer.clearData();
    }
  };
  
  const handleUploadClick = () => {
    setFileToUpload(null);
    setUploadOpen(true);
  };

  const handleUpload = async ({ file, categoryId, name, description }: { file: File; categoryId: string; name: string, description: string }) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
      toast({
        variant: 'destructive',
        title: 'Error al crear hito',
        description: 'La categoría seleccionada no fue encontrada.',
      });
      return;
    }

    const associatedFile: AssociatedFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' :
            file.type.startsWith('audio/') ? 'audio' :
            ['application/pdf', 'application/msword', 'text/plain'].includes(file.type) ? 'document' : 'other',
    };

    const newMilestone: Milestone = {
      id: `hito-${Date.now()}`,
      name,
      description,
      occurredAt: new Date().toISOString(),
      category,
      tags: null,
      associatedFiles: [associatedFile],
    };

    setMilestones(prev => [newMilestone, ...prev]);
    setUploadOpen(false);
    toast({
      title: 'Hito creado',
      description: `${name} ha sido añadido a la bóveda.`,
    });

    try {
      if (description) {
        const result = await autoTagFiles({ textToAnalyze: description });
        setMilestones(prev =>
          prev.map(m =>
            m.id === newMilestone.id ? { ...m, tags: result.tags } : m
          )
        );
      }
    } catch (error) {
      console.error('AI tagging failed:', error);
      setMilestones(prev =>
        prev.map(m =>
          m.id === newMilestone.id ? { ...m, tags: [] } : m
        )
      );
    }
  };

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
        onUploadClick={handleUploadClick} 
        onCategoryColorChange={handleCategoryColorChange}
        onCategoryAdd={handleCategoryAdd}
      />
      <div
        className="flex flex-1 flex-col transition-all duration-300"
        onDragEnter={handleDragEnter}
      >
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSetRange={handleSetRange} />
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-primary/20">
              <div className="rounded-lg border-2 border-dashed border-primary bg-background p-12 text-center">
                <h2 className="text-2xl font-bold text-primary font-headline">Suelta el archivo aquí</h2>
                <p className="text-muted-foreground">Sube tu archivo para crear un nuevo hito</p>
              </div>
            </div>
          )}
          {dateRange ? (
             <Timeline 
                milestones={filteredMilestones} 
                startDate={dateRange.start}
                endDate={dateRange.end}
                onMilestoneClick={handleMilestoneClick}
              />
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-semibold font-headline">Bienvenido a ChronoVault</h2>
                <p className="mt-2 text-muted-foreground">
                  Crea un hito para empezar o arrastra un archivo.
                </p>
              </div>
          )}
        </main>
      </div>

      <FileUpload
        isOpen={isUploadOpen}
        onOpenChange={setUploadOpen}
        categories={categories}
        onUpload={handleUpload}
        initialFile={fileToUpload}
      />

      <MilestoneDetail
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        milestone={selectedMilestone}
      />
    </div>
  );
}
