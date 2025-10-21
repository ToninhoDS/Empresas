import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Task } from '@/entities/Task';
import { Search, Plus, MoreVertical, Star, Phone, GripHorizontal, Filter, Trash2, Settings, MessageSquare, UserPlus, Cog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TaskForm from '@/components/kanban/TaskForm';
import TaskDetails from '@/components/kanban/TaskDetails';
import ColumnForm from '@/components/kanban/ColumnForm';
import LabelManager from '@/components/kanban/LabelManager';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import CardFilter, { CardFilters } from '@/components/kanban/CardFilter';
import TaskCard from './../../src/components/kanban/TaskCard';
import NewColumnForm from '@/components/kanban/NewColumnForm';

const columnsData = {
  nao_lidas: {
    title: 'Não Lidas',
    icon: '🔵'
  },
  aguardando: {
    title: 'Aguardando',
    icon: '🟠'
  },
  sem_agenda: {
    title: 'Sem Agenda',
    icon: '⚙️'
  },
  encaixe: {
    title: 'Encaixe',
    icon: '💬'
  },
  finalizado: {
    title: 'Finalizado',
    icon: '✅'
  }
};

interface ColumnConfig {
  title: string;
  icon: string;
  items: Task[];
  displayConfig?: {
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

const Pipeline = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<any>({});
  const [columnOrder, setColumnOrder] = useState(['nao_lidas', 'aguardando', 'sem_agenda', 'encaixe', 'finalizado']);
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnSearches, setColumnSearches] = useState({
    nao_lidas: '',
    aguardando: '',
    sem_agenda: '',
    encaixe: '',
    finalizado: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [lockColumns, setLockColumns] = useState(false);
  const [editingColumn, setEditingColumn] = useState<{ isNewColumn: boolean; columnId?: string } | null>(null);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [activeFilters, setActiveFilters] = useState<CardFilters>({
    dateRange: {
      from: undefined,
      to: undefined
    },
    messageOrder: null,
    tags: []
  });
  const [columnConfigs, setColumnConfigs] = useState<Record<string, ColumnConfig['displayConfig']>>({});
  const [showNewColumnForm, setShowNewColumnForm] = useState(false);
  const [showColumnConfigForm, setShowColumnConfigForm] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    setupColumns();
  }, [tasks, globalSearch, columnSearches]);

  const setupColumns = () => {
    const newColumns: any = {};
    
    Object.keys(columnsData).forEach(status => {
      let filteredTasks = tasks.filter(task => 
        task.status === status &&
        (task.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
         task.department.toLowerCase().includes(globalSearch.toLowerCase()) ||
         (task.phone && task.phone.includes(globalSearch)))
      );
      
      const columnSearch = columnSearches[status as keyof typeof columnSearches];
      if (columnSearch) {
        filteredTasks = filteredTasks.filter(task => 
          task.title.toLowerCase().includes(columnSearch.toLowerCase()) ||
          (task.phone && task.phone.includes(columnSearch))
        );
      }
      
      newColumns[status] = {
        ...columnsData[status as keyof typeof columnsData],
        items: filteredTasks
      };
    });
    
    setColumns(newColumns);
  };

  const handleDeleteColumn = (columnId: string) => {
    setColumnToDelete(columnId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteColumn = () => {
    if (columnToDelete) {
      const newColumnOrder = columnOrder.filter(id => id !== columnToDelete);
      setColumnOrder(newColumnOrder);
      const newColumns = {...columns};
      delete newColumns[columnToDelete];
      setColumns(newColumns);
      
      toast({
        title: "Coluna removida",
        description: "A coluna foi removida com sucesso!",
      });
      
      setShowDeleteConfirm(false);
      setColumnToDelete(null);
    }
  };

  const toggleFavorite = (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, favorite: !task.favorite };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = async (result: any) => {
    setIsDragging(false);
    
    if (!result.destination) return;

    const { source, destination, draggableId, type } = result;

    // Handle column reordering
    if (type === 'column') {
      const newColumnOrder = Array.from(columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);
      setColumnOrder(newColumnOrder);
      return;
    }

    // Handle card movement between columns
    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, {...removed, status: destination.droppableId});
      
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      });
      
      // Then update backend
      const task = tasks.find(t => t.id === draggableId);
      if (task) {
        try {
          await Task.update(draggableId, {
            ...task,
            status: destination.droppableId as "nao_lidas" | "aguardando" | "sem_agenda" | "encaixe" | "finalizado"
          });
          
          toast({
            title: "Contato movido",
            description: `Contato movido para ${destColumn.title}`,
          });
          
          // Refresh data
          loadTasks();
        } catch (error) {
          console.error("Error updating task status:", error);
          toast({
            title: "Erro ao mover contato",
            description: "Não foi possível atualizar o status do contato.",
            variant: "destructive"
          });
        }
      }
    } else if (source.index !== destination.index) {
      // Reordering within the same column
      const column = columns[source.droppableId];
      const items = [...column.items];
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items
        }
      });
    }
  };

  const loadTasks = async () => {
    try {
      const loadedTasks = await Task.list();
      setTasks(loadedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast({
        title: "Erro ao carregar contatos",
        description: "Não foi possível carregar os contatos. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleColumnSearchChange = (columnId: string, value: string) => {
    setColumnSearches(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  const handleCreateTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleApplyFilters = (filters: CardFilters) => {
    setActiveFilters(filters);
    // Aplicar filtros aos cards
    const filteredColumns = { ...columns };
    Object.keys(filteredColumns).forEach(columnId => {
      let filteredItems = [...filteredColumns[columnId].items];

      // Filtrar por data
      if (filters.dateRange.from || filters.dateRange.to) {
        filteredItems = filteredItems.filter(task => {
          const taskDate = new Date(task.createdAt);
          if (filters.dateRange.from && taskDate < filters.dateRange.from) return false;
          if (filters.dateRange.to && taskDate > filters.dateRange.to) return false;
          return true;
        });
      }

      // Ordenar por data da mensagem
      if (filters.messageOrder) {
        filteredItems.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return filters.messageOrder === 'oldest' 
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        });
      }

      // Filtrar por tags
      if (filters.tags.length > 0) {
        filteredItems = filteredItems.filter(task => 
          task.labels?.some(label => filters.tags.includes(label))
        );
      }

      filteredColumns[columnId] = {
        ...filteredColumns[columnId],
        items: filteredItems
      };
    });

    setColumns(filteredColumns);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate) return;
      
      await Task.update(taskId, { ...taskToUpdate, ...updates });
      toast({
        title: "Contato atualizado",
        description: "As informações do contato foram atualizadas com sucesso."
      });
      
      // Atualizar o estado local para refletir as mudanças imediatamente
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      );
      setTasks(updatedTasks);
      
      // Atualizar as colunas para refletir as mudanças
      setupColumns();
    } catch (error) {
      console.error("Erro ao atualizar o contato:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o contato.",
        variant: "destructive"
      });
    }
  };

  const handleColumnConfigUpdate = (columnId: string, config: ColumnConfig['displayConfig']) => {
    setColumnConfigs(prev => ({
      ...prev,
      [columnId]: config
    }));
    
    // Atualizar a exibição dos cards com base nas novas configurações
    const updatedColumns = { ...columns };
    let filteredItems = [...updatedColumns[columnId].items];

    if (config.showByLabel && config.selectedLabel) {
      filteredItems = filteredItems.filter(task => 
        task.labels?.includes(config.selectedLabel!)
      );
    }

    if (config.showByDate && config.dateRange) {
      filteredItems = filteredItems.filter(task => {
        const taskDate = new Date(task.createdAt);
        const startDate = config.dateRange?.start ? new Date(config.dateRange.start) : null;
        const endDate = config.dateRange?.end ? new Date(config.dateRange.end) : null;

        if (startDate && taskDate < startDate) return false;
        if (endDate && taskDate > endDate) return false;
        return true;
      });
    }

    // Ordenar mensagens conforme configuração
    if (config.showLastMessage || config.showRecentMessage) {
      filteredItems.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return config.showRecentMessage 
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      });
    }

    updatedColumns[columnId] = {
      ...updatedColumns[columnId],
      items: filteredItems,
      displayConfig: config
    };

    setColumns(updatedColumns);
  };

  const handleContactStatusUpdate = async (contactId: string, newStatus: string) => {
    try {
      const task = tasks.find(t => t.id === contactId);
      if (!task) return;

      await Task.update(contactId, {
        ...task,
        status: newStatus as "nao_lidas" | "aguardando" | "sem_agenda" | "encaixe" | "finalizado"
      });
      
      toast({
        title: "Status atualizado",
        description: `Contato movido para ${columns[newStatus].title}`,
      });
      
      loadTasks();
    } catch (error) {
      console.error("Error updating contact status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível mover o contato para a nova coluna.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">Pipeline</h1>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="pl-10"
                  placeholder="Buscar em todas as colunas..."
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFavorites(!showFavorites)}
                className={showFavorites ? "bg-yellow-100" : ""}
              >
                <Star className={`w-4 h-4 mr-2 ${showFavorites ? "text-yellow-500" : ""}`} />
                Favoritos
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowColumnConfigForm(true);
                  setEditingColumnId(columnOrder[0]); // Seleciona a primeira coluna por padrão
                }}
              >
                <Cog className="w-4 h-4 mr-2" />
                Configurações de Coluna
              </Button>
              <Button 
                onClick={() => setShowNewColumnForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Coluna
              </Button>
            </div>
          </div>

          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <Droppable droppableId="board" direction="horizontal" type="COLUMN">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex gap-4 overflow-x-auto pb-4"
                >
                  {columnOrder.map((columnId, index) => {
                    const column = columns[columnId];
                    if (!column) return null;

                    return (
                      <Draggable
                        key={columnId}
                        draggableId={columnId}
                        index={index}
                        isDragDisabled={lockColumns}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-gray-100 rounded-lg p-4 flex flex-col min-w-[300px] max-w-[300px]"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div {...provided.dragHandleProps}>
                                  <GripHorizontal className="w-4 h-4 text-gray-400 cursor-move" />
                                </div>
                                <span>{column.icon}</span>
                                <h2 className="font-semibold">{column.title}</h2>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setShowColumnConfigForm(true);
                                      setEditingColumnId(columnId);
                                    }}
                                  >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Configurações
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setShowFilterDialog(true)}>
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filtrar Cards
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteColumn(columnId)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir Coluna
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="relative mb-4">
                              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                              <Input
                                value={columnSearches[columnId as keyof typeof columnSearches] || ''}
                                onChange={(e) => handleColumnSearchChange(columnId, e.target.value)}
                                className="pl-7 py-1 h-8 text-sm"
                                placeholder="Buscar nesta coluna..."
                              />
                            </div>

                            <Droppable droppableId={columnId} type="TASK">
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className="min-h-[200px] space-y-2 overflow-y-auto max-h-[calc(100vh-220px)] flex-grow pr-1"
                                >
                                  {column.items.map((task: Task, index: number) => (
                                    <Draggable
                                      key={task.id}
                                      draggableId={task.id}
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                        >
                                          <TaskCard
                                            key={task.id}
                                            task={task}
                                            onClick={() => {
                                              setSelectedTask(task);
                                              setShowTaskDetails(true);
                                            }}
                                            isDragging={snapshot.isDragging}
                                            onUpdateTask={handleUpdateTask}
                                            columnConfig={columnConfigs[columnId]}
                                          />
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                  {!column.items?.length && (
                                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center h-[100px] text-gray-400 text-sm">
                                      Arraste contatos para esta coluna
                                    </div>
                                  )}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {showTaskDetails && selectedTask && (
            <TaskDetails
              task={selectedTask}
              onClose={() => setShowTaskDetails(false)}
              onUpdate={async (updatedTask) => {
                try {
                  await Task.update(selectedTask.id, updatedTask);
                  toast({
                    title: "Contato atualizado",
                    description: "Detalhes do contato foram atualizados com sucesso!",
                  });
                  loadTasks();
                } catch (error) {
                  console.error("Error updating task:", error);
                  toast({
                    title: "Erro ao atualizar contato",
                    description: "Não foi possível atualizar os detalhes do contato.",
                    variant: "destructive"
                  });
                }
              }}
            />
          )}

          {showNewColumnForm && (
            <NewColumnForm
              onClose={() => setShowNewColumnForm(false)}
              onSubmit={(newColumn) => {
                setColumns(prev => ({
                  ...prev,
                  [newColumn.id]: {
                    title: newColumn.title,
                    icon: newColumn.icon,
                    items: []
                  }
                }));
                setColumnOrder(prev => [...prev, newColumn.id]);
                setShowNewColumnForm(false);
                
                toast({
                  title: "Coluna criada",
                  description: `A coluna "${newColumn.title}" foi criada com sucesso!`,
                });
              }}
            />
          )}

          {showColumnConfigForm && editingColumnId && (
            <ColumnForm
              onClose={() => {
                setShowColumnConfigForm(false);
                setEditingColumnId(null);
              }}
              onSubmit={(column) => {
                if (column.displayConfig) {
                  handleColumnConfigUpdate(editingColumnId, column.displayConfig);
                }
                
                setShowColumnConfigForm(false);
                setEditingColumnId(null);
                
                toast({
                  title: "Configurações atualizadas",
                  description: "As configurações da coluna foram atualizadas com sucesso!",
                });
              }}
              isNewColumn={false}
              lockColumns={lockColumns}
              onLockColumnsChange={setLockColumns}
            />
          )}

          {showLabelManager && (
            <LabelManager
              onClose={() => setShowLabelManager(false)}
            />
          )}

          <CardFilter
            isOpen={showFilterDialog}
            onClose={() => setShowFilterDialog(false)}
            onApply={handleApplyFilters}
          />

          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir esta coluna? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={confirmDeleteColumn}>
                  Excluir
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Pipeline; 