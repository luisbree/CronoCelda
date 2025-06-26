'use client';

import * as React from 'react';
import type { File as FileType } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  format,
  parseISO,
  subMonths,
  addMonths,
  differenceInMilliseconds,
  eachMonthOfInterval,
} from 'date-fns';

interface TimelineProps {
  files: FileType[];
}

export function Timeline({ files }: TimelineProps) {
  const [heights, setHeights] = React.useState<Map<string, number>>(new Map());

  React.useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    const newHeights = new Map<string, number>();
    if (files.length > 0) {
      files.forEach(file => {
        // Generate a random height between 40px and 140px
        newHeights.set(file.id, Math.floor(Math.random() * 101) + 40);
      });
    }
    setHeights(newHeights);
  }, [files]);

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

  // Files are sorted newest to oldest from parent.
  const oldestFileDate = parseISO(files[files.length - 1].uploadedAt);
  const newestFileDate = parseISO(files[0].uploadedAt);

  // Set the timeline range from 1 month before the first file to 1 month after the last.
  const timelineStart = subMonths(oldestFileDate, 1);
  const timelineEnd = addMonths(newestFileDate, 1);

  const totalTimelineDuration = differenceInMilliseconds(timelineEnd, timelineStart);

  const getPositionOnTimeline = (date: Date) => {
    if (totalTimelineDuration <= 0) {
      return 0;
    }
    const dateOffset = differenceInMilliseconds(date, timelineStart);
    return (dateOffset / totalTimelineDuration) * 100;
  };

  const monthMarkers = eachMonthOfInterval({
    start: timelineStart,
    end: timelineEnd,
  }).map(monthDate => ({
    date: monthDate,
    label: format(monthDate, 'MMM'),
    position: getPositionOnTimeline(monthDate),
  }));

  // Using a large fixed width for the timeline to ensure enough space for proportional rendering.
  const timelineContainerWidth = '3000px';

  return (
    <div className="w-full h-full flex items-end justify-start overflow-x-auto p-4 sm:p-8 pb-16">
      <div className="relative h-full" style={{ width: timelineContainerWidth }}>
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
          {files.map(file => {
            const fileDate = parseISO(file.uploadedAt);
            const position = getPositionOnTimeline(fileDate);

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
                        style={{ height: `${heights.get(file.id) || 60}px` }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border-2 border-background shadow-md group-hover:scale-125 transition-transform z-10"
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
