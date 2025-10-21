import { Task } from '@/entities/Task';

export const seedKanbanData = () => {
  // Verificar se os dados já foram inicializados
  const existingTasks = localStorage.getItem('tasks');
  if (existingTasks) {
    return;
  }

  const sampleTasks = [
    {
      id: '1',
      title: 'João Silva',
      description: 'Preciso de informações sobre o produto X',
      status: 'nao_lidas' as const,
      department: 'tecnologia',
      phone: '(11) 98765-4321',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'Maria Oliveira',
      description: 'Gostaria de agendar uma consulta',
      status: 'aguardando' as const,
      department: 'saude',
      phone: '(21) 99876-5432',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      title: 'Carlos Santos',
      description: 'Dúvida sobre o contrato',
      status: 'sem_agenda' as const,
      department: 'direito',
      phone: '(31) 97654-3210',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      title: 'Ana Pereira',
      description: 'Problema com entrega',
      status: 'encaixe' as const,
      department: 'comercio',
      phone: '(41) 96543-2109',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      title: 'Pedro Souza',
      description: 'Aluno confirmado para aula extra',
      status: 'finalizado' as const,
      department: 'educacao',
      phone: '(51) 95432-1098',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '6',
      title: 'Lucia Ferreira',
      description: 'Interesse em novos produtos',
      status: 'nao_lidas' as const,
      department: 'comercio',
      phone: '(61) 94321-0987',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '7',
      title: 'Roberto Almeida',
      description: 'Consulta sobre novo projeto',
      status: 'aguardando' as const,
      department: 'engenharia',
      phone: '(71) 93210-9876',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '8',
      title: 'Fernanda Lima',
      description: 'Solicitação de orçamento',
      status: 'sem_agenda' as const,
      department: 'tecnologia',
      phone: '(81) 92109-8765',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '9',
      title: 'Gabriel Costa',
      description: 'Problema com configuração do sistema',
      status: 'encaixe' as const,
      department: 'tecnologia',
      phone: '(91) 91098-7654',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '10',
      title: 'Julia Martins',
      description: 'Confirmação de recebimento',
      status: 'finalizado' as const,
      department: 'comercio',
      phone: '(12) 90987-6543',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Salvar no localStorage
  localStorage.setItem('tasks', JSON.stringify(sampleTasks));
};
