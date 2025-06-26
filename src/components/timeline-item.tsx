import type { File as FileType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { FileIcon } from './file-icon';
import { Badge } from './ui/badge';
import { Clock, Tag, Loader2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimelineItemProps {
  file: FileType;
}

export function TimelineItem({ file }: TimelineItemProps) {
  const timeAgo = formatDistanceToNow(parseISO(file.uploadedAt), { addSuffix: true, locale: es });

  return (
    <Card 
      className="transition-shadow duration-300 hover:shadow-lg"
      style={{ borderLeft: `4px solid ${file.category.color}` }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileIcon type={file.type} />
            <div>
              <CardTitle className="text-base font-medium font-headline">{file.name}</CardTitle>
              <CardDescription className="text-xs">
                {file.size}
              </CardDescription>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2 items-center">
            {file.tags === null ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generando etiquetas...</span>
              </div>
            ) : file.tags.length > 0 ? (
              file.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay etiquetas disponibles.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
