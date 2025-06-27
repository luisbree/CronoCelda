'use client';

import * as React from 'react';
import { Logo } from './logo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Search, UploadCloud } from 'lucide-react';
import type { Category } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ColorPicker } from './color-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getMemberBoards, getBoardLists, getCardsInList } from '@/services/trello';
import type { TrelloBoard, TrelloListBasic, TrelloCardBasic } from '@/services/trello';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SidebarProps {
  categories: Category[];
  onCategoryColorChange: (categoryId: string, color: string) => void;
  onCategoryAdd: (name: string) => void;
  onCardSelect: (card: TrelloCardBasic | null) => void;
  selectedCard: TrelloCardBasic | null;
  onNewMilestoneClick: () => void;
}

export function Sidebar({ categories, onCategoryColorChange, onCategoryAdd, onCardSelect, selectedCard, onNewMilestoneClick }: SidebarProps) {
  const [openPopoverId, setOpenPopoverId] = React.useState<string | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');

  const [boards, setBoards] = React.useState<TrelloBoard[]>([]);
  const [lists, setLists] = React.useState<TrelloListBasic[]>([]);
  const [cards, setCards] = React.useState<TrelloCardBasic[]>([]);
  const [filteredCards, setFilteredCards] = React.useState<TrelloCardBasic[]>([]);
  
  const [selectedBoard, setSelectedBoard] = React.useState('');
  const [selectedList, setSelectedList] = React.useState('');
  const [cardSearchTerm, setCardSearchTerm] = React.useState('');
  
  const [isLoadingBoards, setIsLoadingBoards] = React.useState(false);
  const [isLoadingLists, setIsLoadingLists] = React.useState(false);
  const [isLoadingCards, setIsLoadingCards] = React.useState(false);

  React.useEffect(() => {
    const fetchBoards = async () => {
      setIsLoadingBoards(true);
      try {
        const memberBoards = await getMemberBoards();
        setBoards(memberBoards);
      } catch (error) {
        console.error("Failed to fetch boards", error);
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

  React.useEffect(() => {
    onCardSelect(null);
    setCardSearchTerm('');
    setCards([]);
    setFilteredCards([]);

    if (!selectedList) {
        return;
    }
    
    const fetchCards = async () => {
        setIsLoadingCards(true);
        try {
            const listCards = await getCardsInList(selectedList);
            setCards(listCards);
            setFilteredCards(listCards);
        } catch (error) {
            console.error(`Failed to fetch cards for list ${selectedList}`, error);
        } finally {
            setIsLoadingCards(false);
        }
    };
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedList]);
  
  React.useEffect(() => {
    if (!cardSearchTerm) {
      setFilteredCards(cards);
      return;
    }
    const lowercasedFilter = cardSearchTerm.toLowerCase();
    const filtered = cards.filter(card =>
      card.name.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredCards(filtered);
  }, [cardSearchTerm, cards]);


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

  const handleCardClick = (card: TrelloCardBasic) => {
    onCardSelect(card);
  }

  return (
    <aside className="hidden md:flex flex-col w-72 border-r bg-card h-full">
      <div className="h-16 flex items-center border-b shrink-0">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        
        <Button onClick={onNewMilestoneClick} disabled={!selectedCard} size="sm">
          <UploadCloud className="mr-2 h-4 w-4" />
          Hito nuevo
        </Button>

        <div className="space-y-2">
            <Select onValueChange={setSelectedBoard} value={selectedBoard} disabled={isLoadingBoards}>
            <SelectTrigger className="w-full h-9">
                <SelectValue placeholder={isLoadingBoards ? "Cargando tableros..." : "Seleccionar tablero"} />
            </SelectTrigger>
            <SelectContent>
                {boards.map(board => (
                <SelectItem key={board.id} value={board.id}>{board.name}</SelectItem>
                ))}
            </SelectContent>
            </Select>

            <Select onValueChange={setSelectedList} value={selectedList} disabled={!selectedBoard || isLoadingLists}>
            <SelectTrigger className="w-full h-9">
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
                className="pl-9 h-9"
                value={cardSearchTerm}
                onChange={(e) => setCardSearchTerm(e.target.value)}
                disabled={!selectedList || isLoadingCards}
            />
            </div>
        </div>
        
        {selectedList && (
            <div className="flex-1 flex flex-col min-h-0 border rounded-md">
                <div className="p-2 border-b shrink-0">
                    <p className="text-xs font-semibold text-muted-foreground">
                        {`Tarjetas (${filteredCards.length})`}
                    </p>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-1 space-y-1">
                    {isLoadingCards ? (
                        <div className="p-2 space-y-2">
                           <Skeleton className="h-6 w-full" />
                           <Skeleton className="h-6 w-full" />
                           <Skeleton className="h-6 w-5/6" />
                        </div>
                    ) : filteredCards.length > 0 ? (
                        filteredCards.map(card => (
                            <button
                                key={card.id}
                                onClick={() => handleCardClick(card)}
                                className={cn(
                                    "w-full text-left text-sm p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-card-foreground",
                                    selectedCard?.id === card.id && "bg-primary text-primary-foreground hover:bg-primary/90"
                                )}
                            >
                                {card.name}
                            </button>
                        ))
                    ) : (
                        <p className="p-4 text-sm text-muted-foreground text-center">
                            No se encontraron tarjetas.
                        </p>
                    )}
                    </div>
                </ScrollArea>
            </div>
        )}
        
        <div className="mt-auto shrink-0 border-t pt-3 space-y-4">
             <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="py-1 px-1 hover:no-underline text-xs font-semibold tracking-wider uppercase text-muted-foreground justify-start gap-2">
                        Categorías
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                        {isAdding && (
                            <div className="px-1 py-2 mb-2 space-y-2 border rounded-md bg-secondary/30">
                                <Input
                                placeholder="Nombre de la categoría"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategoryConfirm() }}
                                autoFocus
                                className="h-8 text-xs"
                                />
                                <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="sm" className="h-7" onClick={handleAddCategoryCancel}>Cancelar</Button>
                                <Button size="sm" onClick={handleAddCategoryConfirm} disabled={!newCategoryName.trim()} className="h-7">Añadir</Button>
                                </div>
                            </div>
                        )}
                        <div className="space-y-0.5">
                            {categories.map((category) => (
                            <div key={category.id} className="relative flex items-center w-full justify-start rounded-md text-xs font-medium h-7 px-3 hover:bg-accent hover:text-accent-foreground">
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
                        {!isAdding && (
                            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground mt-1" onClick={() => setIsAdding(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Añadir Categoría
                            </Button>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
      </div>
      <div className="p-4 border-t shrink-0">
        <p className="text-xs text-muted-foreground">&copy; 2024 CronoCelda</p>
      </div>
    </aside>
  );
}
