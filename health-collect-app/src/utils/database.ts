
// Database connection utility
interface LoginContact {
  cd_login_contato: number;
  nm_nome: string;
  cd_cartao_ponto: number;
  nm_usuario: string;
  cd_senha: string;
  cd_funcao: string;
  nm_img: string | null;
}

export interface ServiceOrder {
  id_top_rank: number;
  cd_os: string;
  solicitacao: string;
  previsao: string | null;
  servico_sol: string | null;
  setor_sol: string | null;
  solicitante: string | null;
  sit: string | null;
  dias: number | null;
  atend_dia: string | null;
  status: string | null;
  descricao: string | null;
  timestamp: string;
}

// Mock users for now - in a real app this would come from the database
const mockUsers: LoginContact[] = [
  {
    cd_login_contato: 1,
    nm_nome: "Carlos Silva",
    cd_cartao_ponto: 12345,
    nm_usuario: "carlos",
    cd_senha: "123456",
    cd_funcao: "Técnico",
    nm_img: null
  },
  {
    cd_login_contato: 2,
    nm_nome: "Amanda Oliveira",
    cd_cartao_ponto: 54321,
    nm_usuario: "amanda",
    cd_senha: "123456",
    cd_funcao: "Técnico",
    nm_img: null
  },
  {
    cd_login_contato: 3,
    nm_nome: "Rafael Santos",
    cd_cartao_ponto: 67890,
    nm_usuario: "rafael",
    cd_senha: "123456",
    cd_funcao: "Suporte",
    nm_img: null
  },
  {
    cd_login_contato: 4,
    nm_nome: "Wesley Martins",
    cd_cartao_ponto: 98765,
    nm_usuario: "wesley",
    cd_senha: "123456",
    cd_funcao: "Desenvolvimento",
    nm_img: null
  },
  {
    cd_login_contato: 5,
    nm_nome: "Peres Almeida",
    cd_cartao_ponto: 13579,
    nm_usuario: "peres",
    cd_senha: "123456",
    cd_funcao: "Infraestrutura",
    nm_img: null
  },
  {
    cd_login_contato: 6,
    nm_nome: "Garden Ferreira",
    cd_cartao_ponto: 24680,
    nm_usuario: "garden",
    cd_senha: "123456",
    cd_funcao: "TI Adm",
    nm_img: null
  }
];

// Database functions with improved debugging
export const findUserByBadge = async (badgeNumber: number): Promise<LoginContact | null> => {
  console.log('[database] Finding user by badge:', badgeNumber);
  const user = mockUsers.find(user => user.cd_cartao_ponto === badgeNumber);
  console.log('[database] User found:', user);
  return user || null;
};

export const authenticateUser = async (badgeNumber: number): Promise<LoginContact | null> => {
  console.log('[database] Authenticating user:', badgeNumber);
  return findUserByBadge(badgeNumber);
};

export const getAllServiceOrders = async (): Promise<ServiceOrder[]> => {
  console.log('[database] Getting all service orders from API');
  try {
    const response = await fetch('http://localhost:5000/api/service-orders');
    if (!response.ok) {
      throw new Error('Falha ao buscar ordens de serviço');
    }
    const data = await response.json();
    console.log('[database] Fetched service orders:', data.length, 'records');
    return data;
  } catch (error) {
    console.error('[database] Error fetching service orders:', error);
    return [];
  }
};

export const getServiceOrdersByTechnician = async (technicianName: string): Promise<ServiceOrder[]> => {
  console.log('[database] Filtering orders by technician:', technicianName);
  try {
    const response = await fetch(`http://localhost:5000/api/service-orders/technician/${technicianName}`);
    if (!response.ok) {
      throw new Error('Falha ao buscar ordens por técnico');
    }
    const data = await response.json();
    console.log('[database] Filtered orders:', data.length, 'records');
    return data;
  } catch (error) {
    console.error('[database] Error fetching orders by technician:', error);
    return [];
  }
};

export const getServiceOrdersByStatus = async (status: string, technicianName?: string): Promise<ServiceOrder[]> => {
  console.log('[database] Filtering orders by status:', status, 'and technician:', technicianName);
  try {
    const response = await fetch(`http://localhost:5000/api/service-orders/status/${status}`);
    if (!response.ok) {
      throw new Error('Falha ao buscar ordens por status');
    }
    let data = await response.json();
    
    // Filtrar por técnico se necessário
    if (technicianName && technicianName !== 'TODOS') {
      data = data.filter((order: ServiceOrder) => order.atend_dia === technicianName);
    }
    
    console.log('[database] Filtered orders by status and technician:', data.length, 'records');
    return data;
  } catch (error) {
    console.error('[database] Error fetching orders by status:', error);
    return [];
  }
};

export const getNewServiceOrders = async (): Promise<ServiceOrder[]> => {
  console.log('[database] Getting new service orders (no technician assigned)');
  try {
    const response = await fetch('http://localhost:5000/api/service-orders/new');
    if (!response.ok) {
      throw new Error('Falha ao buscar novas ordens');
    }
    const data = await response.json();
    console.log('[database] New orders found:', data.length, 'records');
    return data;
  } catch (error) {
    console.error('[database] Error fetching new orders:', error);
    return [];
  }
};

export const getTodayServiceOrders = async (): Promise<ServiceOrder[]> => {
  console.log('[database] Getting today service orders');
  try {
    const response = await fetch('http://localhost:5000/api/service-orders/today');
    if (!response.ok) {
      throw new Error('Falha ao buscar ordens do dia');
    }
    const data = await response.json();
    console.log('[database] Today orders found:', data.length, 'records');
    return data;
  } catch (error) {
    console.error('[database] Error fetching today orders:', error);
    return [];
  }
};

// Save user to localStorage
export const saveUserToStorage = (user: LoginContact): void => {
  localStorage.setItem('user', JSON.stringify({
    id: user.cd_login_contato.toString(),
    name: user.nm_nome.split(' ')[0], // Just the first name
    role: user.cd_funcao,
    department: user.cd_funcao,
    badge: user.cd_cartao_ponto
  }));
};

// Local storage helper
export const clearUserStorage = (): void => {
  localStorage.removeItem('user');
};
