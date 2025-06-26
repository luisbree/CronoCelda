'use client';

import { Logo } from './logo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PlusCircle, Plus } from 'lucide-react';
import type { Category } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ColorPicker } from './color-picker';
import * as React from 'react';

interface SidebarProps {
  categories: Category[];
  onUploadClick: () => void;
  onCategoryColorChange: (categoryId: string, color: string) => void;
  onCategoryAdd: (name: string) => void;
}

export function Sidebar({ categories, onUploadClick, onCategoryColorChange, onCategoryAdd }: SidebarProps) {
  const [openPopoverId, setOpenPopoverId] = React.useState<string | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');

  const handleColorSelect = (categoryId: string, color: string) => {
    onCategoryColorChange(categoryId, color);
    setOpenPopoverId(null);
  };

  const handleAddCategoryConfirm = () => {
    if (newCategoryName.trim()) {
      onCategoryAdd(newCategoryName.trim());
      setNewCategoryName('');
      setIsAdding(false);
    }
  };

  const handleAddCategoryCancel = () => {
    setIsAdding(false);
    setNewCategoryName('');
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
            <div className="flex items-center justify-between px-2 mb-2">
              <h2 className="text-lg font-semibold tracking-tight font-headline">Categorías</h2>
              {!isAdding && (
                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsAdding(true)}>
                    <Plus className="h-4 w-4" />
                 </Button>
              )}
            </div>

            {isAdding && (
              <div className="px-3 py-2 mb-2 space-y-3 border rounded-md bg-secondary/30">
                <Input
                  placeholder="Nombre de la categoría"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategoryConfirm() }}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={handleAddCategoryCancel}>Cancelar</Button>
                  <Button size="sm" onClick={handleAddCategoryConfirm} disabled={!newCategoryName.trim()}>Añadir</Button>
                </div>
              </div>
            )}

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
