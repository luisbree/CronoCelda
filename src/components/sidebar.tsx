import { Logo } from './logo';
import { Button } from './ui/button';
import { PlusCircle, Folder } from 'lucide-react';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface SidebarProps {
  categories: Category[];
  onUploadClick: () => void;
}

export function Sidebar({ categories, onUploadClick }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card h-full">
      <div className="h-16 flex items-center border-b">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-4">
          <div>
            <Button className="w-full" onClick={onUploadClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </div>
          <div>
            <h2 className="px-2 mb-2 text-lg font-semibold tracking-tight">Categories</h2>
            <div className="space-y-1">
              {categories.map((category, index) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start'
                  )}
                >
                  <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: category.color }} />
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </nav>
      </div>
      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 ChronoVault</p>
      </div>
    </aside>
  );
}
