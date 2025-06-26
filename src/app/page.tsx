'use client';

import * as React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Timeline } from '@/components/timeline';
import { FileUpload } from '@/components/file-upload';
import { type File as FileType, type Category } from '@/types';
import { FILES, CATEGORIES } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { autoTagFiles } from '@/ai/flows/auto-tag-files';
import { addMonths, parseISO, subMonths, subYears } from 'date-fns';

export default function Home() {
  const [files, setFiles] = React.useState<FileType[]>(FILES);
  const [categories] = React.useState<Category[]>(CATEGORIES);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploadOpen, setUploadOpen] = React.useState(false);
  const [fileToUpload, setFileToUpload] = React.useState<File | null>(null);
  const [dateRange, setDateRange] = React.useState<{ start: Date; end: Date } | null>(null);

  const { toast } = useToast();

  React.useEffect(() => {
    // Initialize with "All" view
    if (files.length > 0) {
      const allDates = files.map(f => parseISO(f.uploadedAt));
      const oldest = new Date(Math.min(...allDates.map(d => d.getTime())));
      const newest = new Date(Math.max(...allDates.map(d => d.getTime())));
      setDateRange({
        start: subMonths(oldest, 1),
        end: addMonths(newest, 1),
      });
    }
  }, [files]);

  const handleSetRange = (rangeType: '1M' | '1Y' | 'All') => {
    const now = new Date();
    if (rangeType === '1M') {
      setDateRange({ start: subMonths(now, 1), end: now });
    } else if (rangeType === '1Y') {
      setDateRange({ start: subYears(now, 1), end: now });
    } else { // 'All'
      if (files.length > 0) {
        const allDates = files.map(f => parseISO(f.uploadedAt));
        const oldest = new Date(Math.min(...allDates.map(d => d.getTime())));
        const newest = new Date(Math.max(...allDates.map(d => d.getTime())));
        setDateRange({
          start: subMonths(oldest, 1),
          end: addMonths(newest, 1),
        });
      }
    }
  };


  const filteredFiles = files
    .filter(file =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.tags && file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

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

  const handleUpload = async ({ file, categoryId }: { file: File; categoryId: string }) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
      toast({
        variant: 'destructive',
        title: 'Error uploading file',
        description: 'Selected category not found.',
      });
      return;
    }

    const newFile: FileType = {
      id: `file-${Date.now()}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      uploadedAt: new Date().toISOString(),
      category,
      tags: null, // Initially null, will be populated by AI
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' :
            file.type.startsWith('audio/') ? 'audio' :
            ['application/pdf', 'application/msword', 'text/plain'].includes(file.type) ? 'document' : 'other',
    };

    setFiles(prevFiles => [newFile, ...prevFiles]);
    setUploadOpen(false);
    toast({
      title: 'File uploaded',
      description: `${file.name} has been added to the vault.`,
    });

    // AI Tagging
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const content = event.target?.result as string;
            if (content) {
                const result = await autoTagFiles({ fileContent: content.slice(0, 2000) }); // Limit content size for performance
                setFiles(prevFiles =>
                  prevFiles.map(f =>
                    f.id === newFile.id ? { ...f, tags: result.tags } : f
                  )
                );
            }
        } catch (error) {
            console.error('AI tagging failed:', error);
            // Set empty tags on failure
            setFiles(prevFiles =>
                prevFiles.map(f =>
                  f.id === newFile.id ? { ...f, tags: [] } : f
                )
              );
        }
    };
    
    // Only read text-based files for tagging
    if(file.type.startsWith('text/') || file.type.includes('json') || file.type.includes('csv')) {
        reader.readAsText(file);
    } else {
        // For non-text files, set tags to empty array
        setFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === newFile.id ? { ...f, tags: [] } : f
            )
          );
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar categories={categories} onUploadClick={handleUploadClick} />
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
                <h2 className="text-2xl font-bold text-primary">Drop files here</h2>
                <p className="text-muted-foreground">Upload your files to ChronoVault</p>
              </div>
            </div>
          )}
          {dateRange ? (
             <Timeline 
                files={filteredFiles} 
                startDate={dateRange.start}
                endDate={dateRange.end}
              />
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-semibold">Welcome to ChronoVault</h2>
                <p className="mt-2 text-muted-foreground">
                  Drag and drop a file to get started or use the upload button.
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
    </div>
  );
}
