import type { File as FileType } from '@/types';
import { TimelineItem } from './timeline-item';
import { format, isSameDay, parseISO } from 'date-fns';

const groupFilesByDate = (files: FileType[]) => {
  if (!files || files.length === 0) {
    return {};
  }
  return files.reduce((acc: { [key: string]: FileType[] }, file) => {
    const date = format(parseISO(file.uploadedAt), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(file);
    return acc;
  }, {});
};

const formatDateHeading = (dateString: string) => {
  const date = parseISO(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) {
    return 'Today';
  }
  if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  }
  return format(date, 'MMMM d, yyyy');
};


interface TimelineProps {
  files: FileType[];
}

export function Timeline({ files }: TimelineProps) {
  const groupedFiles = groupFilesByDate(files);
  const sortedDates = Object.keys(groupedFiles).sort().reverse();

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

  return (
    <div className="space-y-8">
      {sortedDates.map(date => (
        <div key={date} className="relative">
          <div className="absolute left-5 top-2 h-full w-0.5 bg-border -z-10" />
          <div className="flex items-center">
            <div className="z-10 flex items-center justify-center w-10 h-10 bg-background rounded-full border-2 border-primary/20">
              <div className="w-3 h-3 bg-primary rounded-full" />
            </div>
            <h2 className="ml-4 text-lg font-semibold text-primary">{formatDateHeading(date)}</h2>
          </div>
          <div className="ml-5 pl-10 space-y-4 pt-4">
            {groupedFiles[date].map(file => (
              <TimelineItem key={file.id} file={file} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
