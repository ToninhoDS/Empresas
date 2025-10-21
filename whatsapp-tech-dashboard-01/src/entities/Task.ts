// Task entity for managing contact data in the Kanban board

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'nao_lidas' | 'aguardando' | 'sem_agenda' | 'encaixe' | 'finalizado';
  department: string;
  phone?: string;
  favorite?: boolean;
  assignedTo?: string;
  collaborators?: string[];
  labels?: string[];
  observations?: string;
  messages?: Array<{
    id: string;
    content: string;
    createdAt: Date;
    type: 'sent' | 'received';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskData = Omit<Task, 'createdAt' | 'updatedAt'>;

// Mock de dados para desenvolvimento
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'João Silva',
    description: 'Consulta de rotina',
    status: 'nao_lidas',
    department: 'Clínica Geral',
    phone: '11999999999',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Maria Santos',
    description: 'Retorno de exames',
    status: 'aguardando',
    department: 'Cardiologia',
    phone: '11988888888',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    title: 'Pedro Oliveira',
    description: 'Primeira consulta',
    status: 'sem_agenda',
    department: 'Ortopedia',
    phone: '11977777777',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Funções de CRUD
export const Task = {
  list: async (): Promise<Task[]> => {
    // Simula uma chamada à API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTasks);
      }, 500);
    });
  },

  create: async (task: Partial<Task>): Promise<Task> => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: task.title || '',
      description: task.description,
      status: task.status || 'nao_lidas',
      department: task.department || '',
      phone: task.phone,
      favorite: task.favorite || false,
      assignedTo: task.assignedTo,
      collaborators: task.collaborators || [],
      labels: task.labels || [],
      observations: task.observations,
      messages: task.messages || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockTasks.push(newTask);
    return newTask;
  },

  update: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const taskIndex = mockTasks.findIndex(t => t.id === id);
    if (taskIndex === -1) throw new Error('Task not found');

    const updatedTask = {
      ...mockTasks[taskIndex],
      ...updates,
      updatedAt: new Date()
    };

    mockTasks[taskIndex] = updatedTask;
    return updatedTask;
  },

  delete: async (id: string): Promise<void> => {
    const taskIndex = mockTasks.findIndex(t => t.id === id);
    if (taskIndex === -1) throw new Error('Task not found');
    mockTasks.splice(taskIndex, 1);
  }
};
