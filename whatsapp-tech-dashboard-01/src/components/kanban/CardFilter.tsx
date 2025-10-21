import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: CardFilters) => void;
}

export interface CardFilters {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  messageOrder: 'oldest' | 'newest' | null;
  tags: string[];
}

const AVAILABLE_TAGS = [
  { id: 'urgent', name: 'Urgente', color: 'bg-red-100 text-red-800' },
  { id: 'encaixe', name: 'Encaixe', color: 'bg-blue-100 text-blue-800' },
  { id: 'waiting', name: 'Aguardando', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'reschedule', name: 'Remarcar', color: 'bg-purple-100 text-purple-800' },
  { id: 'waiting_queue', name: 'Aguardando em Caixa', color: 'bg-green-100 text-green-800' }
];

export default function CardFilter({ isOpen, onClose, onApply }: CardFilterProps) {
  const [filters, setFilters] = useState<CardFilters>({
    dateRange: {
      from: undefined,
      to: undefined
    },
    messageOrder: null,
    tags: []
  });

  const handleDateSelect = (date: Date | undefined, type: 'from' | 'to') => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: date
      }
    }));
  };

  const handleTagToggle = (tagId: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtrar Cards</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Período</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">De</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? (
                        format(filters.dateRange.from, "PP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from}
                      onSelect={(date) => handleDateSelect(date, 'from')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Até</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.to ? (
                        format(filters.dateRange.to, "PP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to}
                      onSelect={(date) => handleDateSelect(date, 'to')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ordenação por Mensagem</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="oldest"
                  checked={filters.messageOrder === 'oldest'}
                  onCheckedChange={() => setFilters(prev => ({
                    ...prev,
                    messageOrder: prev.messageOrder === 'oldest' ? null : 'oldest'
                  }))}
                />
                <Label htmlFor="oldest">Mais antigas primeiro</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="newest"
                  checked={filters.messageOrder === 'newest'}
                  onCheckedChange={() => setFilters(prev => ({
                    ...prev,
                    messageOrder: prev.messageOrder === 'newest' ? null : 'newest'
                  }))}
                />
                <Label htmlFor="newest">Mais recentes primeiro</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_TAGS.map(tag => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag.id}
                    checked={filters.tags.includes(tag.id)}
                    onCheckedChange={() => handleTagToggle(tag.id)}
                  />
                  <Label
                    htmlFor={tag.id}
                    className={cn("text-sm cursor-pointer flex items-center", tag.color)}
                  >
                    <div className={cn("w-3 h-3 rounded-full mr-1", tag.color.split(' ')[0])} />
                    {tag.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancelar
          </Button>
          <Button onClick={handleApply}>
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 