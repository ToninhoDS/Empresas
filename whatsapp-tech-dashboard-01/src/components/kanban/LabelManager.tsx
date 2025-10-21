
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const LABELS = [
  { id: 'nao_lidas', name: 'Não Lidas', color: 'bg-blue-100 text-blue-800' },
  { id: 'aguardando', name: 'Aguardando', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'sem_agenda', name: 'Sem Agenda', color: 'bg-purple-100 text-purple-800' },
  { id: 'encaixe', name: 'Encaixe', color: 'bg-green-100 text-green-800' },
  { id: 'finalizado', name: 'Finalizado', color: 'bg-gray-100 text-gray-800' }
];

interface LabelManagerProps {
  onClose: () => void;
}

export default function LabelManager({ onClose }: LabelManagerProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Gerenciar Etiquetas</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            {LABELS.map(label => (
              <div key={label.id} className="flex items-center justify-between">
                <Badge className={`${label.color}`}>
                  {label.name}
                </Badge>
                <Button variant="ghost" size="sm">
                  Aplicar
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
