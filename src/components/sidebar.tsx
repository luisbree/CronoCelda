import { Logo } from './logo';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import type { Category } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ColorPicker } from './color-picker';
import * as React from 'react';

interface SidebarProps {
  categories: Category[];
  onUploadClick: () => void;
  onCategoryColorChange: (categoryId: string, color: string) => void;
}

export function Sidebar({ categories, onUploadClick, onCategoryColorChange }: SidebarProps) {
  const [openPopoverId, setOpenPopoverId] = React.useState<string | null>(null);

  const handleColorSelect = (categoryId: string, color: string) => {
    onCategoryColorChange(categoryId, color);
    setOpenPopoverId(null); // Close the popover after selection
  };
  
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
              Subir Archivo
            </Button>
          </div>
          <div>
            <h2 className="px-2 mb-2 text-lg font-semibold tracking-tight font-headline">Categorías</h2>
            <div className="space-y-1">
              {categories.map((category) => (
                <div key={category.id} className="relative flex items-center w-full justify-start rounded-md text-sm font-medium h-9 px-3 hover:bg-accent hover:text-accent-foreground">
                  <Popover open={openPopoverId === category.id} onOpenChange={(isOpen) => setOpenPopoverId(isOpen ? category.id : null)}>
                    <PopoverTrigger asChild>
                      <button
                        className="w-2 h-2 rounded-full shrink-0 transition-transform hover:scale-125 focus:outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        style={{ backgroundColor: category.color }}
                        aria-label={`Cambiar color de la categoría ${category.name}`}
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <ColorPicker onColorSelect={(color) => handleColorSelect(category.id, color)} />
                    </PopoverContent>
                  </Popover>
                  <span className="ml-3">{category.name}</span>
                </div>
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
