import { FC, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStatus: (status: string) => void;
  contactName: string;
  contactPhone: string;
  columns: {
    id: string;
    title: string;
    icon: string;
  }[];
  forceSelection?: boolean;
  currentStatus?: string;
}

const StatusSelectionDialog: FC<StatusSelectionDialogProps> = ({
  isOpen,
  onClose,
  onSelectStatus,
  contactName,
  contactPhone,
  columns,
  forceSelection = false,
  currentStatus
}) => {
  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedStatusId(currentStatus || null);
    }
  }, [isOpen, currentStatus]);

  const handleClose = () => {
    if (forceSelection && !selectedStatusId) {
      // Não fecha se for obrigatório selecionar e nenhum status foi selecionado
      return;
    }
    onClose();
  };

  const handleStatusSelect = (statusId: string) => {
    setSelectedStatusId(statusId);
    onSelectStatus(statusId);
    if (!forceSelection) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-[500px]" 
        onEscapeKeyDown={(e) => {
          if (forceSelection && !selectedStatusId) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          if (forceSelection && !selectedStatusId) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (forceSelection && !selectedStatusId) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Selecione o Status do Contato</DialogTitle>
          {forceSelection && (
            <DialogDescription className="text-red-500">
              É necessário selecionar um novo status para o contato antes de continuar.
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Contato</h4>
            <p className="font-medium">{contactName}</p>
            <p className="text-sm text-gray-600">{contactPhone}</p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-500">Selecione um status:</h4>
            <div className="grid grid-cols-2 gap-2">
              {columns.map((column) => (
                <Button
                  key={column.id}
                  variant="outline"
                  className={cn(
                    "h-auto py-3 px-4 justify-start",
                    "hover:bg-gray-100 hover:text-gray-900",
                    "focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                    selectedStatusId === column.id && "border-primary bg-primary/10"
                  )}
                  onClick={() => handleStatusSelect(column.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{column.icon}</span>
                    <Badge variant="secondary" className="font-normal">
                      {column.title}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusSelectionDialog; 