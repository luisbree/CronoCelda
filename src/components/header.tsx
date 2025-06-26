import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function Header({ searchTerm, setSearchTerm }: HeaderProps) {
  return (
    <header className="flex h-16 items-center border-b bg-card px-4 md:px-6 w-full shrink-0">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search files, categories, or tags..."
            className="pl-9 w-full md:w-1/2 lg:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <Avatar>
        <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="person portrait" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </header>
  );
}
