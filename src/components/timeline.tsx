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
  differenceInMonths,
  getMonth,
  getYear,
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
  visibleFiles: FileType[];
}

export function Timeline({ files, startDate, endDate }: TimelineProps) {
  const [timelineData, setTimelineData] = React.useState<TimelineData | null>(null);
  const heights = React.useRef(new Map<string, number>());
  const timelineContainerRef = React.useRef<HTMLDivElement>(null);
  const [viewRange, setViewRange] = React.useState({ start: startDate, end: endDate });
  const [isPanning, setIsPanning] = React.useState(false);
  const panStartRef = React.useRef({x: 0, rangeStart: new Date(), rangeEnd: new Date()});

  React.useEffect(() => {
    // Initialize heights only once
    const newHeights = heights.current;
    if (newHeights.size === 0 && files.length > 0) {
      files.forEach(file => {
        let hash = 0;
        for (let i = 0; i < file.id.length; i++) {
          const char = file.id.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash |= 0;
        }
        newHeights.set(file.id, (Math.abs(hash) % 101) + 40);
      });
    }
  }, [files]);
  
  React.useEffect(() => {
    setViewRange({ start: startDate, end: endDate });
  }, [startDate, endDate]);


  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const container = timelineContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseXPercent = (e.clientX - rect.left) / rect.width;
    
    const currentDuration = viewRange.end.getTime() - viewRange.start.getTime();
    if(currentDuration <= 0) return;

    const zoomIntensity = 0.1;
    const delta = currentDuration * zoomIntensity * (e.deltaY > 0 ? 1 : -1);
    
    const newStartMs = viewRange.start.getTime() - delta * mouseXPercent;
    const newEndMs = viewRange.end.getTime() + delta * (1 - mouseXPercent);

    if (newEndMs <= newStartMs) {
        return; 
    }
    
    setViewRange({
        start: new Date(newStartMs),
        end: new Date(newEndMs),
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 2 && e.button !== 1) return; // Only right or middle click
    e.preventDefault();
    setIsPanning(true);
    panStartRef.current = {
        x: e.clientX,
        rangeStart: viewRange.start,
        rangeEnd: viewRange.end,
    };
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();

    const container = timelineContainerRef.current;
    if (!container) return;
    
    const deltaX = e.clientX - panStartRef.current.x;
    if (deltaX === 0) return;

    const fullDuration = panStartRef.current.rangeEnd.getTime() - panStartRef.current.rangeStart.getTime();
    const pixelToMs = fullDuration / container.offsetWidth;
    const timeDelta = deltaX * pixelToMs;

    setViewRange({
        start: new Date(panStartRef.current.rangeStart.getTime() - timeDelta),
        end: new Date(panStartRef.current.rangeEnd.getTime() - timeDelta),
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button !== 2 && e.button !== 1) return;
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
  };

  React.useEffect(() => {
    const timelineStart = viewRange.start;
    const timelineEnd = viewRange.end;

    const visibleFiles = files.filter(file => {
        const fileDate = parseISO(file.uploadedAt);
        return fileDate >= timelineStart && fileDate <= timelineEnd;
    });

    if (timelineStart && timelineEnd && timelineEnd > timelineStart) {
      const totalTimelineDuration = differenceInMilliseconds(timelineEnd, timelineStart);

      const getPositionOnTimeline = (date: Date) => {
        if (totalTimelineDuration <= 0) return 0;
        const dateOffset = differenceInMilliseconds(date, timelineStart);
        return (dateOffset / totalTimelineDuration) * 100;
      };
      
      const durationInMonths = differenceInMonths(timelineEnd, timelineStart);
      const durationInYears = durationInMonths / 12;

      const rawMonthMarkersSource = eachMonthOfInterval({
        start: timelineStart,
        end: timelineEnd,
      });

      let filteredMonths: Date[];

      if (durationInYears >= 2) {
        // For ranges >= 2 years, show only January
        const targetMonths = [0]; // 0-indexed: January
        filteredMonths = rawMonthMarkersSource.filter(date => targetMonths.includes(getMonth(date)));
      } else if (durationInYears >= 1) {
        // For ranges >= 1 year, show Jan, Apr, Jul, Oct
        const targetMonths = [0, 3, 6, 9]; // 0-indexed: Jan, Apr, Jul, Oct
        filteredMonths = rawMonthMarkersSource.filter(date => targetMonths.includes(getMonth(date)));
      } else {
        // For ranges < 1 year, show every other month
        filteredMonths = rawMonthMarkersSource.filter(date => getMonth(date) % 2 === 0);
      }

      let lastShownYear: number | null = null;
      const monthMarkers = filteredMonths.map((monthDate) => {
        const year = getYear(monthDate);
        let label: string;

        if (durationInMonths < 12) {
          // If it's the first marker, or the year has changed, show the year.
          if (lastShownYear === null || year !== lastShownYear) {
            label = format(monthDate, 'MMM yyyy');
          } else {
            label = format(monthDate, 'MMM');
          }
          lastShownYear = year;
        } else {
          // For longer ranges, always show the year for clarity.
          label = format(monthDate, 'MMM yyyy');
        }
        
        return {
          date: monthDate,
          label,
          position: getPositionOnTimeline(monthDate),
        };
      }).reduce((acc, marker) => {
        if (!acc.find(m => m.label === marker.label)) {
          acc.push(marker);
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
        visibleFiles,
      });
    } else {
      setTimelineData({
        monthMarkers: [],
        filePositions: new Map(),
        visibleFiles: [],
      });
    }
  }, [files, viewRange]);


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

  const { monthMarkers, filePositions, visibleFiles } = timelineData;
  
  const filesInView = visibleFiles.filter(file => {
    const pos = filePositions.get(file.id);
    return pos !== undefined && pos >= 0 && pos <= 100;
  });

  if (filesInView.length === 0 && files.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-semibold">No files in this time range.</h2>
        <p className="mt-2 text-muted-foreground">
          Try zooming out or selecting a different time range.
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={timelineContainerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "w-full h-full flex items-end justify-start p-4 sm:p-8 pb-16 touch-none cursor-grab",
        isPanning && "cursor-grabbing"
      )}
    >
      <div 
        className="relative h-full w-full"
      >
        <div className="absolute bottom-7 left-0 right-0 h-px bg-gray-400" />

        {monthMarkers.map(({ label, position }) => (
          position >= 0 && position <= 100 && (
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
          )
        ))}

        <TooltipProvider>
          {visibleFiles.map(file => {
            const fileDate = parseISO(file.uploadedAt);
            const position = filePositions.get(file.id) ?? 0;
            const height = heights.current.get(file.id) ?? 60;

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
