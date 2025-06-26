'use client';

import * as React from 'react';
import type { File as FileType } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, parseISO } from 'date-fns';

interface TimelineProps {
  files: FileType[];
}

export function Timeline({ files }: TimelineProps) {
  // Use a map to store the random heights for each file to ensure consistency on re-renders
  const [heights, setHeights] = React.useState<Map<string, number>>(new Map());

  React.useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    const newHeights = new Map<string, number>();
    files.forEach(file => {
      // Generate a random height between 40px and 140px
      newHeights.set(file.id, Math.floor(Math.random() * 101) + 40);
    });
    setHeights(newHeights);
  }, [files]); // Recalculate heights when the list of files changes

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-semibold">Welcome to ChronoVault</h2>
        <p className="mt-2 text-muted-foreground">
          Drag and drop a file to get started or use the upload button.
        </p>
      </div>
    );
  }

  // The parent component sorts files newest to oldest. Reverse for a chronological timeline.
  const sortedFiles = [...files].reverse();

  return (
    <div className="w-full h-full flex items-center justify-start overflow-x-auto p-4 sm:p-8 pt-12 pb-16">
      <div className="relative flex items-end h-full w-full min-w-max">
        {/* The horizontal time axis */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-400" />
        
        <TooltipProvider>
          <div className="flex items-end gap-10 sm:gap-12 pl-4">
            {sortedFiles.map((file) => (
              <div key={file.id} className="relative flex flex-col items-center">
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center cursor-pointer group">
                      {/* The dot/circle at the top */}
                      <div
                        className="w-4 h-4 rounded-full border-2 border-background shadow-md group-hover:scale-125 transition-transform z-10"
                        style={{ backgroundColor: file.category.color }}
                      />
                      {/* The vertical line */}
                      <div
                        className="w-px -mt-2 bg-gray-300"
                        style={{ height: `${heights.get(file.id) || 60}px` }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(file.uploadedAt), "PPP 'at' p")}
                    </p>
                  </TooltipContent>
                </Tooltip>
                {/* The date label below the axis */}
                <div className="absolute -bottom-7 text-xs text-muted-foreground whitespace-nowrap">
                  {format(parseISO(file.uploadedAt), 'MMM d')}
                </div>
              </div>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
