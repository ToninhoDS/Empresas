import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, User, MessageSquare } from "lucide-react";
import { TaskData } from '@/entities/Task';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Mock de colaboradores (substitua por dados reais do seu sistema)
const MOCK_COLLABORATORS = [
  { id: '1', name: 'João Silva' },
  { id: '2', name: 'Maria Santos' },
  { id: '3', name: 'Pedro Oliveira' },
];

interface TaskDetailsProps {
  task: TaskData;
  onClose: () => void;
  onUpdate: (task: TaskData) => void;
}

export default function TaskDetails({ task, onClose, onUpdate }: TaskDetailsProps) {
  const [editedTask, setEditedTask] = useState<TaskData>({
    ...task,
    observations: task.observations || '',
    assignedTo: task.assignedTo || '',
    collaborators: task.collaborators || []
  });

  const handleAddCollaborator = (collaboratorId: string) => {
    if (!editedTask.collaborators?.includes(collaboratorId)) {
      setEditedTask(prev => ({
        ...prev,
        collaborators: [...(prev.collaborators || []), collaboratorId]
      }));
    }
  };

  const handleRemoveCollaborator = (collaboratorId: string) => {
    setEditedTask(prev => ({
      ...prev,
      collaborators: prev.collaborators?.filter(id => id !== collaboratorId)
    }));
  };

  const handleSave = () => {
    onUpdate(editedTask);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Contato</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Atribuir para</Label>
            <div className="flex gap-2">
              <Select
                value={editedTask.assignedTo}
                onValueChange={(value) => setEditedTask(prev => ({
                  ...prev,
                  assignedTo: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_COLLABORATORS.map(collaborator => (
                    <SelectItem key={collaborator.id} value={collaborator.id}>
                      {collaborator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Colaboradores</Label>
            <div className="flex flex-wrap gap-2">
              {editedTask.collaborators?.map(collaboratorId => {
                const collaborator = MOCK_COLLABORATORS.find(c => c.id === collaboratorId);
                return collaborator ? (
                  <Badge
                    key={collaboratorId}
                    className="bg-gray-100 text-gray-800 cursor-pointer"
                    onClick={() => handleRemoveCollaborator(collaboratorId)}
                  >
                    {collaborator.name}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ) : null;
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={editedTask.observations || ''}
              onChange={(e) => setEditedTask(prev => ({
                ...prev,
                observations: e.target.value
              }))}
              placeholder="Adicione observações sobre este contato..."
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
