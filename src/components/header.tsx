import { Input } from './ui/input';
import { Search, List, ExternalLink, Home } from 'lucide-react';
import { Button } from './ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from '@/components/ui/tooltip';
import { AuthButton } from './auth-button';
import { useAuth } from '@/context/auth-context';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSetRange: (range: '1D' | '1M' | '1Y' | 'All') => void;
  onOpenSummary: () => void;
  onGoHome: () => void;
  trelloCardUrl: string | null;
  isProjectLoaded: boolean;
}

export function Header({ searchTerm, setSearchTerm, onSetRange, onOpenSummary, onGoHome, trelloCardUrl, isProjectLoaded }: HeaderProps) {
  const { user } = useAuth();
  
  return (
    <header className="flex h-16 items-center border-b bg-card px-4 md:px-6 w-full shrink-0 gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={isProjectLoaded ? "Buscar archivos, categorías o etiquetas..." : "Cargá un proyecto para poder buscar"}
            className="pl-9 w-full md:w-1/2 lg:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!isProjectLoaded}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="icon" variant="outline" onClick={onGoHome}>
                            <Home className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Volver al inicio</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="icon" variant="outline" onClick={onOpenSummary} disabled={!isProjectLoaded}>
                            <List className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Ver resumen de hitos</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <a
                           href={trelloCardUrl ?? undefined}
                           target="_blank"
                           rel="noopener noreferrer"
                           aria-disabled={!trelloCardUrl || !user}
                           tabIndex={!trelloCardUrl || !user ? -1 : undefined}
                           className={!trelloCardUrl || !user ? 'pointer-events-none' : ''}
                        >
                            <Button size="icon" variant="outline" disabled={!trelloCardUrl || !user}>
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </a>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Abrir tarjeta en Trello</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          <Button size="sm" variant="outline" onClick={() => onSetRange('1D')} disabled={!isProjectLoaded}>Hoy</Button>
          <Button size="sm" variant="outline" onClick={() => onSetRange('1M')} disabled={!isProjectLoaded}>1M</Button>
          <Button size="sm" variant="outline" onClick={() => onSetRange('1Y')} disabled={!isProjectLoaded}>1A</Button>
          <Button size="sm" variant="outline" onClick={() => onSetRange('All')} disabled={!isProjectLoaded}>Todo</Button>
      </div>
      <AuthButton />
    </header>
  );
}
