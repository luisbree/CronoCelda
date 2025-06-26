import { Input } from './ui/input';
import { Search, List } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from '@/components/ui/tooltip';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSetRange: (range: '1M' | '1Y' | 'All') => void;
  onOpenSummary: () => void;
}

export function Header({ searchTerm, setSearchTerm, onSetRange, onOpenSummary }: HeaderProps) {
  return (
    <header className="flex h-16 items-center border-b bg-card px-4 md:px-6 w-full shrink-0 gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar archivos, categorías o etiquetas..."
            className="pl-9 w-full md:w-1/2 lg:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="icon" variant="outline" onClick={onOpenSummary}>
                            <List className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Ver resumen de hitos</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          <Button size="sm" variant="outline" onClick={() => onSetRange('1M')}>1M</Button>
          <Button size="sm" variant="outline" onClick={() => onSetRange('1Y')}>1A</Button>
          <Button size="sm" variant="outline" onClick={() => onSetRange('All')}>Todo</Button>
      </div>
      <Avatar>
        <AvatarImage src="https://placehold.co/100x100.png" alt="Usuario" data-ai-hint="person portrait" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </header>
  );
}
