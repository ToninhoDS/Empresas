
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Task } from '@/entities/Task';
import { Search, Plus, MoreVertical, Star, Phone, GripHorizontal, Filter, Trash2, Settings, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TaskForm from '@/components/kanban/TaskForm';
import TaskDetails from '@/components/kanban/TaskDetails';
import ColumnForm from '@/components/kanban/ColumnForm';
import LabelManager from '@/components/kanban/LabelManager';
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const Index = () => {
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

  const handleTaskSubmit = async (taskData: any) => {
    try {
      if (editingTask) {
        await Task.update(editingTask.id, taskData);
        toast({
          title: "Contato atualizado",
          description: "O contato foi atualizado com sucesso!",
        });
      } else {
        await Task.create(taskData);
        toast({
          title: "Contato criado",
          description: "O novo contato foi criado com sucesso!",
        });
      }
      setShowForm(false);
      setEditingTask(null);
      loadTasks();
    } catch (error) {
      console.error("Error submitting task:", error);
      toast({
        title: "Erro ao salvar contato",
        description: "Não foi possível salvar as informações do contato.",
        variant: "destructive"
      });
    }
  };

  const handleCreateTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleDeleteColumn = (columnId: string) => {
    const newColumnOrder = columnOrder.filter(id => id !== columnId);
    setColumnOrder(newColumnOrder);
    const newColumns = {...columns};
    delete newColumns[columnId];
    setColumns(newColumns);
    
    toast({
      title: "Coluna removida",
      description: "A coluna foi removida com sucesso!",
    });
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="pl-10"
                placeholder="Buscar em todas as colunas..."
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowLabelManager(true)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Etiquetas
              </Button>
              <Button onClick={() => handleAddTask()}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Contato
              </Button>
              <Button onClick={() => setShowColumnForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Coluna
              </Button>
            </div>
          </div>

          {showForm && (
            <TaskForm
              onSubmit={handleTaskSubmit}
              onCancel={() => setShowForm(false)}
              task={editingTask}
            />
          )}

          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <Droppable droppableId="columns" direction="horizontal" type="column">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
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
                                  <DropdownMenuItem>
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filtrar Cards
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Configurações
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

                            <Droppable droppableId={columnId}>
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className="min-h-[200px] space-y-2 overflow-y-auto max-h-[calc(100vh-220px)] flex-grow pr-1"
                                >
                                  {column.items?.length > 0 && column.items.map((task: Task, index: number) => (
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
                                          className={`bg-white rounded-lg p-4 shadow-sm ${
                                            snapshot.isDragging ? 'shadow-lg z-50' : ''
                                          }`}
                                          onClick={() => !snapshot.isDragging && handleCreateTask(task)}
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                {task.title[0].toUpperCase()}
                                              </div>
                                              <div>
                                                <span className="font-medium block">{task.title}</span>
                                                {task.phone && (
                                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                                    <Phone className="w-3 h-3 mr-1" />
                                                    {task.phone}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                              <Star className="h-4 w-4 text-gray-400" />
                                            </Button>
                                          </div>
                                          <div className="text-sm text-gray-500 capitalize">
                                            {task.department}
                                          </div>
                                          {task.description && (
                                            <div className="mt-2 text-sm text-gray-600 truncate">
                                              {task.description}
                                            </div>
                                          )}
                                          <div className="mt-4">
                                            <Button 
                                              variant="outline" 
                                              size="sm" 
                                              className="text-xs w-full justify-center"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                              }}
                                            >
                                              <UserPlus className="w-3 h-3 mr-1" />
                                              Criar Tarefa
                                            </Button>
                                          </div>
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

          {showColumnForm && (
            <ColumnForm
              onClose={() => setShowColumnForm(false)}
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
                setShowColumnForm(false);
                toast({
                  title: "Coluna criada",
                  description: `A coluna "${newColumn.title}" foi criada com sucesso!`,
                });
              }}
            />
          )}

          {showLabelManager && (
            <LabelManager
              onClose={() => setShowLabelManager(false)}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
