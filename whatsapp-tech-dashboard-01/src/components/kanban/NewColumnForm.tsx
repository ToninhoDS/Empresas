import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Smile, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewColumnFormProps {
  onClose: () => void;
  onSubmit: (column: { id: string; title: string; icon: string }) => void;
}

const COLUMN_TITLES = [
  { id: 'nao_lida', title: 'Não lida' },
  { id: 'aguardando', title: 'Aguardando' },
  { id: 'sem_agendamento', title: 'Sem agendamento' },
  { id: 'encaixe', title: 'Encaixe' },
  { id: 'finalizada', title: 'Finalizada' },
  { id: 'personalizado', title: 'Título Personalizado' }
];

const EMOJI_CATEGORIES = [
  {
    category: 'Expressões',
    emojis: ['😊', '😂', '😍', '🤔', '😎', '😴', '😇', '🤗']
  },
  {
    category: 'Objetos',
    emojis: ['📋', '📝', '📌', '📎', '✅', '⭐', '💬', '📞']
  },
  {
    category: 'Símbolos',
    emojis: ['❤️', '💯', '⚡', '🔥', '✨', '💫', '🎯', '💪']
  },
  {
    category: 'Bandeiras',
    emojis: ['🔵', '🔴', '⚫', '⚪', '🟢', '🟡', '🟣', '🟤']
  }
];

const NewColumnForm: React.FC<NewColumnFormProps> = ({
  onClose,
  onSubmit
}) => {
  const [selectedTitle, setSelectedTitle] = useState<string>('nao_lida');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [selectedEmoji, setSelectedEmoji] = useState<string>('📋');
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);

  const handleSubmit = () => {
    const title = selectedTitle === 'personalizado' ? customTitle : COLUMN_TITLES.find(c => c.id === selectedTitle)?.title || '';
    const id = selectedTitle === 'personalizado' ? `custom_${Date.now()}` : selectedTitle;
    
    onSubmit({
      id,
      title,
      icon: selectedEmoji
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Coluna</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Coluna</Label>
            <Select value={selectedTitle} onValueChange={setSelectedTitle}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um título" />
              </SelectTrigger>
              <SelectContent>
                {COLUMN_TITLES.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedTitle === 'personalizado' && (
            <div className="space-y-2">
              <Label htmlFor="custom-title">Título Personalizado</Label>
              <Input
                id="custom-title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Digite o título personalizado"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Ícone</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>{selectedEmoji}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0">
                <div className="border-b px-3 py-2">
                  <div className="flex gap-2">
                    {EMOJI_CATEGORIES.map((category, index) => (
                      <Button
                        key={category.category}
                        variant={activeCategoryIndex === index ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setActiveCategoryIndex(index)}
                      >
                        {category.emojis[0]}
                      </Button>
                    ))}
                  </div>
                </div>
                <ScrollArea className="h-[200px] px-3 py-2">
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJI_CATEGORIES[activeCategoryIndex].emojis.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedEmoji(emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={selectedTitle === 'personalizado' && !customTitle.trim()}>
            Criar Coluna
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewColumnForm; 