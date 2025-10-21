import { type FC, useState, Dispatch, SetStateAction } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ColumnFormProps {
  onClose: () => void;
  onSubmit: (column: { displayConfig: ColumnDisplayConfig }) => void;
  isNewColumn: boolean;
  lockColumns: boolean;
  onLockColumnsChange: Dispatch<SetStateAction<boolean>>;
}

interface ColumnDisplayConfig {
  showLastMessage: boolean;
  showRecentMessage: boolean;
  showByLabel: boolean;
  selectedLabel?: string;
  showByDate: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Lista de etiquetas disponíveis
const DEFAULT_LABELS = [
  { id: 'urgent', name: 'Urgente', color: 'bg-red-100 text-red-800' },
  { id: 'encaixe', name: 'Encaixe', color: 'bg-blue-100 text-blue-800' },
  { id: 'waiting', name: 'Aguardando', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'reschedule', name: 'Remarcar', color: 'bg-purple-100 text-purple-800' },
  { id: 'waiting_queue', name: 'Aguardando em Caixa', color: 'bg-green-100 text-green-800' }
];

const ColumnForm: FC<ColumnFormProps> = ({
  onClose,
  onSubmit,
  isNewColumn,
  lockColumns,
  onLockColumnsChange
}) => {
  const [displayConfig, setDisplayConfig] = useState<ColumnDisplayConfig>({
    showLastMessage: false,
    showRecentMessage: false,
    showByLabel: false,
    showByDate: false,
  });

  const handleSubmit = () => {
    onSubmit({ displayConfig });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Configurações de Coluna</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Seção destacada para o bloqueio de movimentação */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lock-columns"
                checked={lockColumns}
                onCheckedChange={(checked) => onLockColumnsChange(checked === true)}
              />
              <Label htmlFor="lock-columns" className="font-medium">
                Bloquear movimentação de coluna
              </Label>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Configurações de Exibição</h3>
            
            <div className="space-y-4 pl-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-last-message"
                  checked={displayConfig.showLastMessage}
                  onCheckedChange={(checked) => 
                    setDisplayConfig(prev => ({ ...prev, showLastMessage: checked === true }))
                  }
                />
                <Label htmlFor="show-last-message">Exibir última mensagem (mais antiga)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-recent-message"
                  checked={displayConfig.showRecentMessage}
                  onCheckedChange={(checked) => 
                    setDisplayConfig(prev => ({ ...prev, showRecentMessage: checked === true }))
                  }
                />
                <Label htmlFor="show-recent-message">Exibir mensagem mais recente</Label>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-by-label"
                    checked={displayConfig.showByLabel}
                    onCheckedChange={(checked) => 
                      setDisplayConfig(prev => ({ ...prev, showByLabel: checked === true }))
                    }
                  />
                  <Label htmlFor="show-by-label">Exibir por etiqueta</Label>
                </div>
                
                {displayConfig.showByLabel && (
                  <div className="ml-6">
                    <Select
                      value={displayConfig.selectedLabel}
                      onValueChange={(value) => 
                        setDisplayConfig(prev => ({ ...prev, selectedLabel: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma etiqueta" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEFAULT_LABELS.map((label) => (
                          <SelectItem key={label.id} value={label.id}>
                            {label.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-by-date"
                    checked={displayConfig.showByDate}
                    onCheckedChange={(checked) => 
                      setDisplayConfig(prev => ({ ...prev, showByDate: checked === true }))
                    }
                  />
                  <Label htmlFor="show-by-date">Exibir por data</Label>
                </div>
                
                {displayConfig.showByDate && (
                  <div className="ml-6 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="date-start">Data Inicial</Label>
                      <Input
                        id="date-start"
                        type="date"
                        value={displayConfig.dateRange?.start}
                        onChange={(e) => 
                          setDisplayConfig(prev => ({
                            ...prev,
                            dateRange: {
                              ...prev.dateRange,
                              start: e.target.value
                            }
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="date-end">Data Final</Label>
                      <Input
                        id="date-end"
                        type="date"
                        value={displayConfig.dateRange?.end}
                        onChange={(e) => 
                          setDisplayConfig(prev => ({
                            ...prev,
                            dateRange: {
                              ...prev.dateRange,
                              end: e.target.value
                            }
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar Alterações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnForm;
