import { type FC, useState } from 'react';
import { Task } from '@/entities/Task';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import ContactDetailsModal from '@/components/contacts/ContactDetailsModal';
import { Contact } from '@/types/contact';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isDragging?: boolean;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  columnConfig?: {
    showLastMessage: boolean;
    showRecentMessage: boolean;
    showByLabel: boolean;
    selectedLabel?: string;
    showByDate: boolean;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

const AVAILABLE_LABELS = [
  { id: 'urgent', name: 'Urgente', color: 'bg-red-100 text-red-800', borderColor: 'border-l-red-500' },
  { id: 'encaixe', name: 'Encaixe', color: 'bg-blue-100 text-blue-800', borderColor: 'border-l-blue-500' },
  { id: 'waiting', name: 'Aguardando', color: 'bg-yellow-100 text-yellow-800', borderColor: 'border-l-yellow-500' },
  { id: 'reschedule', name: 'Remarcar', color: 'bg-purple-100 text-purple-800', borderColor: 'border-l-purple-500' },
  { id: 'waiting_queue', name: 'Aguardando em Caixa', color: 'bg-green-100 text-green-800', borderColor: 'border-l-green-500' }
];

const TaskCard: FC<TaskCardProps> = ({ task, onClick, isDragging, onUpdateTask, columnConfig }) => {
  const [showLabelsPopover, setShowLabelsPopover] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);
  
  // Limitar o nome a 13 caracteres
  const truncateName = (name: string) => {
    return name.length > 13 ? name.substring(0, 13) + '...' : name;
  };
  
  // Determinar a cor da borda com base na primeira etiqueta
  const getBorderColor = () => {
    if (!task.labels || task.labels.length === 0) return '';
    const firstLabel = AVAILABLE_LABELS.find(l => l.id === task.labels?.[0]);
    return firstLabel ? firstLabel.borderColor : '';
  };
  
  const handleLabelToggle = (labelId: string) => {
    if (!onUpdateTask) return;
    
    const updatedLabels = task.labels?.includes(labelId)
      ? (task.labels?.filter(id => id !== labelId) || [])
      : [...(task.labels || []), labelId];
      
    onUpdateTask(task.id, { labels: updatedLabels });
  };
  
  const handleTagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLabelsPopover(true);
  };
  
  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowContactDetails(true);
  };
  
  // Verificar se o card tem etiquetas
  const hasLabels = task.labels && task.labels.length > 0;

  // Mensagens pré-definidas
  const predefinedMessages = [
    { id: 1, title: "Saudação", content: "Olá! Como posso ajudar?" },
    { id: 2, title: "Agradecimento", content: "Muito obrigado pelo contato!" },
    { id: 3, title: "Confirmação", content: "Confirmo o recebimento da sua mensagem." }
  ];

  const handleWhatsAppRedirect = () => {
    const phoneNumber = task.phone?.replace(/\D/g, '');
    if (phoneNumber) {
      window.open(`https://web.whatsapp.com/send/?phone=${phoneNumber}&type=phone_number&app_absent=0`, '_blank');
    }
  };

  const handleWhatsAppRedirectWithMessage = (message: string) => {
    const phoneNumber = task.phone?.replace(/\D/g, '');
    if (phoneNumber) {
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://web.whatsapp.com/send/?phone=${phoneNumber}&text=${encodedMessage}&type=phone_number&app_absent=0`, '_blank');
    }
  };

  // Converter Task para Contact para usar no ContactDetailsModal
  const contactFromTask: Contact = {
    id: task.id,
    name: task.title,
    phoneNumber: task.phone || '',
    specialty: task.department,
    lastMessage: task.messages && task.messages.length > 0 
      ? task.messages[task.messages.length - 1].content 
      : "Nenhuma mensagem",
    lastMessageTime: task.messages && task.messages.length > 0 
      ? task.messages[task.messages.length - 1].createdAt.toISOString() 
      : task.updatedAt.toISOString(),
    totalMessages: task.messages?.length || 0,
    profileImage: undefined
  };

  // Função para atualizar o status da task
  const handleStatusUpdate = (taskId: string, newStatus: string) => {
    if (onUpdateTask) {
      onUpdateTask(taskId, {
        ...task,
        status: newStatus as Task['status']
      });
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow border-l-4",
                getBorderColor(),
                isDragging && "shadow-lg z-50"
              )}
              onClick={onClick}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {task.title[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium block">{truncateName(task.title)}</span>
                    {task.phone && (
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Phone className="w-3 h-3 mr-1" />
                        {task.phone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={handleChatClick}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Abrir o chat</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Popover open={showLabelsPopover} onOpenChange={setShowLabelsPopover}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={cn("h-8 w-8", hasLabels && "bg-gray-100")}
                              onClick={handleTagClick}
                            >
                              <Tag className={cn("w-4 h-4", hasLabels && "text-primary")} />
                            </Button>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Etiquetas</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <PopoverContent className="w-56 p-3" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Etiquetas</h4>
                        <div className="space-y-2">
                          {AVAILABLE_LABELS.map(label => (
                            <div key={label.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`label-${task.id}-${label.id}`}
                                checked={task.labels?.includes(label.id)}
                                onCheckedChange={() => handleLabelToggle(label.id)}
                              />
                              <Label
                                htmlFor={`label-${task.id}-${label.id}`}
                                className={cn("text-sm cursor-pointer", label.color)}
                              >
                                {label.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {hasLabels && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {task.labels.map(labelId => {
                    const label = AVAILABLE_LABELS.find(l => l.id === labelId);
                    return label ? (
                      <Badge
                        key={labelId}
                        className={cn("text-xs", label.color)}
                      >
                        {label.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}

              {/* Exibir mensagens de acordo com as configurações */}
              {(columnConfig?.showLastMessage || columnConfig?.showRecentMessage) && task.messages && task.messages.length > 0 && (
                <div className="mt-3 text-sm text-gray-600 border-t pt-2">
                  <p className="text-xs text-gray-500 mb-1">
                    {columnConfig.showRecentMessage ? "Mensagem mais recente:" : "Última mensagem:"}
                  </p>
                  <p className="line-clamp-2">
                    {columnConfig.showRecentMessage 
                      ? task.messages[task.messages.length - 1].content
                      : task.messages[0].content
                    }
                  </p>
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mais informações</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Modal de Detalhes do Contato */}
      {showContactDetails && (
        <ContactDetailsModal
          contact={contactFromTask}
          isOpen={showContactDetails}
          onClose={() => setShowContactDetails(false)}
          onUpdateStatus={handleStatusUpdate}
          currentStatus={task.status}
        />
      )}
    </>
  );
};

export default TaskCard; 