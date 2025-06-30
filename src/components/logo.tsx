import { FolderClock } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 px-4">
      <FolderClock className="h-7 w-7 text-card-foreground" />
      <h1 className="text-xl font-medium text-card-foreground font-headline">CronoCelda</h1>
    </div>
  );
}
