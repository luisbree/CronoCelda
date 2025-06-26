'use client';

import * as React from 'react';
import type { File as FileType } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  format,
  parseISO,
  differenceInMilliseconds,
  eachMonthOfInterval,
} from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';

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
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [panOffset, setPanOffset] = React.useState(0);
  const [isPanning, setIsPanning] = React.useState(false);
  const [lastMouseX, setLastMouseX] = React.useState(0);
  const timelineContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Reset pan and zoom when date range changes from the header buttons
    setZoomLevel(1);
    setPanOffset(0);

    const heights = new Map<string, number>();
    files.forEach(file => {
      heights.set(file.id, Math.floor(Math.random() * 101) + 40);
    });
    
    const timelineStart = startDate;
    const timelineEnd = endDate;

    const visibleFiles = files.filter(file => {
        const fileDate = parseISO(file.uploadedAt);
        return fileDate >= timelineStart && fileDate <= timelineEnd;
    });

    if (visibleFiles.length > 0) {
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
      setTimelineData({
        monthMarkers: [],
        filePositions: new Map(),
        heights,
        visibleFiles: [],
      });
    }
  }, [files, startDate, endDate]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const container = timelineContainerRef.current;
    if (!container) return;

    const delta = e.deltaY * -0.001;
    const newZoomLevel = Math.max(1, zoomLevel + delta);
    
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    const mousePointOnTimeline = (mouseX - panOffset) / zoomLevel;
    const newPanOffset = mouseX - mousePointOnTimeline * newZoomLevel;
    
    const maxPan = 0;
    const minPan = container.clientWidth - container.clientWidth * newZoomLevel;
    const clampedPanOffset = Math.min(maxPan, Math.max(minPan, newPanOffset));

    setZoomLevel(newZoomLevel);
    setPanOffset(clampedPanOffset);
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 2) { // Right mouse button
      e.preventDefault();
      setIsPanning(true);
      setLastMouseX(e.clientX);
    }
  };
  
  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (isPanning && timelineContainerRef.current) {
      const dx = e.clientX - lastMouseX;
      setLastMouseX(e.clientX);
      const newPanOffset = panOffset + dx;
      const containerWidth = timelineContainerRef.current.clientWidth;
      const maxPan = 0;
      const minPan = containerWidth - (containerWidth * zoomLevel);
      const clampedPanOffset = Math.min(maxPan, Math.max(minPan, newPanOffset));
      setPanOffset(clampedPanOffset);
    }
  }, [isPanning, lastMouseX, panOffset, zoomLevel]);
  
  const handleMouseUp = React.useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleMouseLeave = () => {
    setIsPanning(false);
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  }

  React.useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, handleMouseMove, handleMouseUp]);


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

  if (!timelineData) {
    return (
      <div className="w-full h-full flex items-end justify-start p-4 sm:p-8 pb-16">
        <div className="relative h-full w-full">
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
      ref={timelineContainerRef}
      className={cn(
        "w-full h-full flex items-end justify-start p-4 sm:p-8 pb-16 overflow-hidden cursor-grab",
        isPanning && "cursor-grabbing"
      )}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
    >
      <div 
        className="relative h-full"
        style={{
          width: `${100 * zoomLevel}%`,
          transform: `translateX(${panOffset}px)`,
          transition: isPanning ? 'none' : 'transform 0.1s ease-out, width 0.1s ease-out'
        }}
      >
        <div className="absolute bottom-7 left-0 right-0 h-px bg-gray-400" />

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

        <TooltipProvider>
          {visibleFiles.map(file => {
            const fileDate = parseISO(file.uploadedAt);
            const position = filePositions.get(file.id) ?? 0;
            const height = heights.get(file.id) ?? 60;

            if (position < 0 || position > 100) return null;

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
                        className="w-2.5 h-2.5 rounded-full border-2 border-background shadow-md group-hover:scale-125 transition-transform z-10"
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
