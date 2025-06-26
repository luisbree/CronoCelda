'use client';

import * as React from 'react';
import type { File as FileType } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  format,
  parseISO,
  differenceInMilliseconds,
  eachMonthOfInterval,
} from 'date-fns';
import { Skeleton } from './ui/skeleton';

interface TimelineProps {
  files: FileType[];
  startDate: Date;
  endDate: Date;
}

interface TimelineData {
  monthMarkers: { date: Date; label: string; position: number }[];
  filePositions: Map<string, number>;
  heights: Map<string, number>;
  visibleFiles: FileType[];
}

export function Timeline({ files, startDate, endDate }: TimelineProps) {
  const [timelineData, setTimelineData] = React.useState<TimelineData | null>(null);

  React.useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    // This prevents hydration mismatches between server and client.
    
    // All calculations that might differ between server/client are done here.
    const heights = new Map<string, number>();
    files.forEach(file => {
      // Math.random() is a source of hydration errors if run during server render.
      heights.set(file.id, Math.floor(Math.random() * 101) + 40);
    });

    const timelineStart = startDate;
    const timelineEnd = endDate;

    const visibleFiles = files.filter(file => {
        const fileDate = parseISO(file.uploadedAt);
        return fileDate >= timelineStart && fileDate <= timelineEnd;
    });

    if (visibleFiles.length > 0) {
      // Date calculations can have floating point discrepancies between environments.
      const totalTimelineDuration = differenceInMilliseconds(timelineEnd, timelineStart);

      const getPositionOnTimeline = (date: Date) => {
        if (totalTimelineDuration <= 0) return 0;
        const dateOffset = differenceInMilliseconds(date, timelineStart);
        return (dateOffset / totalTimelineDuration) * 100;
      };

      const rawMonthMarkers = eachMonthOfInterval({
        start: timelineStart,
        end: timelineEnd,
      });

      // Avoid duplicate month labels if range is small
      const monthMarkers = rawMonthMarkers.reduce((acc, monthDate) => {
        const label = format(monthDate, 'MMM yyyy');
        if (!acc.find(m => m.label === label)) {
          acc.push({
            date: monthDate,
            label: label,
            position: getPositionOnTimeline(monthDate),
          });
        }
        return acc;
      }, [] as { date: Date; label: string; position: number }[]);
      
      const filePositions = new Map<string, number>();
      visibleFiles.forEach(file => {
        const fileDate = parseISO(file.uploadedAt);
        const position = getPositionOnTimeline(fileDate);
        filePositions.set(file.id, position);
      });

      setTimelineData({
        monthMarkers,
        filePositions,
        heights,
        visibleFiles,
      });
    } else {
      // Clear data if no files in range
      setTimelineData({
        monthMarkers: [],
        filePositions: new Map(),
        heights,
        visibleFiles: [],
      });
    }
  }, [files, startDate, endDate]);


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

  // On initial render (server and client), timelineData is null.
  // We render a placeholder to ensure the DOM matches.
  if (!timelineData) {
    return (
      <div className="w-full h-full flex items-end justify-start p-4 sm:p-8 pb-16">
        <div className="relative h-full w-full">
          {/* The horizontal time axis */}
          <div className="absolute bottom-7 left-0 right-0 h-px bg-gray-400" />
          <div className="w-full h-32 flex items-end">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  const { monthMarkers, filePositions, heights, visibleFiles } = timelineData;
  
  if (visibleFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-semibold">No files in this time range.</h2>
        <p className="mt-2 text-muted-foreground">
          Try selecting a different time range or upload new files.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full flex items-end justify-start p-4 sm:p-8 pb-16"
    >
      <div className="relative h-full w-full">
        {/* The horizontal time axis */}
        <div className="absolute bottom-7 left-0 right-0 h-px bg-gray-400" />

        {/* Month Markers */}
        {monthMarkers.map(({ label, position }) => (
          <div
            key={label + position}
            className="absolute -bottom-0.5 flex flex-col items-center"
            style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
          >
            <div className="h-2 w-px bg-gray-400" />
            <span className="absolute top-4 text-xs text-muted-foreground whitespace-nowrap">
              {label}
            </span>
          </div>
        ))}

        {/* File Markers */}
        <TooltipProvider>
          {visibleFiles.map(file => {
            const fileDate = parseISO(file.uploadedAt);
            const position = filePositions.get(file.id) ?? 0;
            const height = heights.get(file.id) ?? 60;

            // Don't render if outside viewport, gives a little margin
            if (position < -5 || position > 105) return null;

            return (
              <div
                key={file.id}
                className="absolute bottom-7 flex flex-col items-center"
                style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
              >
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col-reverse items-center cursor-pointer group">
                      <div
                        className="w-px bg-gray-300"
                        style={{ height: `${height}px` }}
                      />
                      <div
                        className="w-3 h-3 rounded-full border-2 border-background shadow-md group-hover:scale-125 transition-transform z-10"
                        style={{ backgroundColor: file.category.color }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(fileDate, "PPP 'at' p")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
