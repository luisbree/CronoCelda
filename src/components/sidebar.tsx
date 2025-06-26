'use client';

import * as React from 'react';
import { Logo } from './logo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PlusCircle, Plus, Search } from 'lucide-react';
import type { Category } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ColorPicker } from './color-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getMemberBoards, getBoardLists } from '@/services/trello';
import type { TrelloBoard, TrelloListBasic } from '@/services/trello';


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

  const [boards, setBoards] = React.useState<TrelloBoard[]>([]);
  const [lists, setLists] = React.useState<TrelloListBasic[]>([]);
  const [selectedBoard, setSelectedBoard] = React.useState('');
  const [selectedList, setSelectedList] = React.useState('');
  const [cardSearchTerm, setCardSearchTerm] = React.useState('');
  const [isLoadingBoards, setIsLoadingBoards] = React.useState(false);
  const [isLoadingLists, setIsLoadingLists] = React.useState(false);

  React.useEffect(() => {
    const fetchBoards = async () => {
      setIsLoadingBoards(true);
      try {
        const memberBoards = await getMemberBoards();
        setBoards(memberBoards);
      } catch (error) {
        console.error("Failed to fetch boards", error);
        // Opcionalmente, mostrar un toast al usuario
      } finally {
        setIsLoadingBoards(false);
      }
    };
    fetchBoards();
  }, []);

  React.useEffect(() => {
    if (!selectedBoard) {
      setLists([]);
      setSelectedList('');
      return;
    }

    const fetchLists = async () => {
      setIsLoadingLists(true);
      setLists([]);
      try {
        const boardLists = await getBoardLists(selectedBoard);
        setLists(boardLists);
      } catch (error) {
        console.error(`Failed to fetch lists for board ${selectedBoard}`, error);
      } finally {
        setIsLoadingLists(false);
      }
    };
    fetchLists();
  }, [selectedBoard]);


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
        <nav className="p-4 space-y-4 h-full flex flex-col">
          <div>
            <div className="space-y-3 mb-4">
              <Select onValueChange={setSelectedBoard} value={selectedBoard} disabled={isLoadingBoards}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingBoards ? "Cargando tableros..." : "Seleccionar tablero"} />
                </SelectTrigger>
                <SelectContent>
                  {boards.map(board => (
                    <SelectItem key={board.id} value={board.id}>{board.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={setSelectedList} value={selectedList} disabled={!selectedBoard || isLoadingLists}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingLists ? "Cargando listas..." : "Seleccionar lista"} />
                </SelectTrigger>
                <SelectContent>
                  {lists.map(list => (
                    <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar una tarjeta..."
                  className="pl-9"
                  value={cardSearchTerm}
                  onChange={(e) => setCardSearchTerm(e.target.value)}
                  disabled={!selectedList}
                />
              </div>
            </div>
            <Button className="w-full" onClick={onUploadClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Hito nuevo
            </Button>
          </div>
          <div className="mt-auto">
            <div className="flex items-center justify-between px-2 mb-2">
              <h2 className="text-sm font-semibold tracking-tight font-headline">Categorías</h2>
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

            <div className="space-y-0.5">
              {categories.map((category) => (
                <div key={category.id} className="relative flex items-center w-full justify-start rounded-md text-xs font-medium h-8 px-3 hover:bg-accent hover:text-accent-foreground">
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
        <p className="text-xs text-muted-foreground">&copy; 2024 CronoCelda</p>
      </div>
    </aside>
  );
}
