
import { ServiceOrder } from '@/utils/database';

export interface Order {
  id: string;
  date: string;
  sector: string;
  tech: string;
}

export interface OrderDetail {
  id: string;
  time: string;
  sector: string;
  title: string;
  description: string;
  requester: string;
  status: string;
  priority: string;
}

export interface Technician {
  id: number;
  name: string;
}

// Helper function to convert ServiceOrder to Order format
export const convertToOrderFormat = (serviceOrder: ServiceOrder): Order => {
  const date = new Date(serviceOrder.solicitacao);
  const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = date.toLocaleDateString('pt-BR');
  
  return {
    id: serviceOrder.cd_os,
    date: `${formattedTime} - ${formattedDate}`,
    sector: serviceOrder.setor_sol || '',
    tech: serviceOrder.atend_dia || ''
  };
};

// Helper function to convert ServiceOrder to OrderDetail format
export const convertToOrderDetail = (serviceOrder: ServiceOrder): OrderDetail => {
  const date = new Date(serviceOrder.solicitacao);
  const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  return {
    id: serviceOrder.cd_os,
    time: formattedTime,
    sector: serviceOrder.setor_sol || '',
    title: serviceOrder.servico_sol || 'Sem título',
    description: serviceOrder.descricao || 'Sem descrição',
    requester: serviceOrder.solicitante || '',
    status: serviceOrder.sit || 'Pendente',
    priority: 'Baixa' // This field doesn't exist in tb_top_rank, defaulting to "Baixa"
  };
};
