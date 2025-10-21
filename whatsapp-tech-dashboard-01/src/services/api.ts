import { supabase } from '@/lib/supabase'

// Tipos
interface Empresa {
  id?: number
  nome: string
  cnpj?: string
  email: string
  telefone?: string
  endereco?: string
  status?: 'ativa' | 'inativa' | 'trial'
}

interface Usuario {
  id?: number
  empresa_id: number
  nome: string
  email: string
  telefone?: string
  cargo: string
  ativo?: boolean
}

// Serviços de Empresa
export const empresaService = {
  async criar(empresa: Empresa) {
    const { data, error } = await supabase
      .from('empresas')
      .insert(empresa)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async atualizar(id: number, empresa: Partial<Empresa>) {
    const { data, error } = await supabase
      .from('empresas')
      .update(empresa)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async buscarPorId(id: number) {
    const { data, error } = await supabase
      .from('empresas')
      .select()
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async listar() {
    const { data, error } = await supabase
      .from('empresas')
      .select()
    
    if (error) throw error
    return data
  }
}

// Serviços de Usuário
export const usuarioService = {
  async criar(usuario: Usuario) {
    const { data, error } = await supabase
      .from('colaboradores_empresa')
      .insert(usuario)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async atualizar(id: number, usuario: Partial<Usuario>) {
    const { data, error } = await supabase
      .from('colaboradores_empresa')
      .update(usuario)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async buscarPorId(id: number) {
    const { data, error } = await supabase
      .from('colaboradores_empresa')
      .select()
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async listarPorEmpresa(empresaId: string) {
    try {
      console.log('Iniciando busca de usuários para empresa:', empresaId);
      
      const { data, error } = await supabase
        .from('perfis_usuario')
        .select('*')
        .eq('empresa_id', empresaId);

      if (error) {
        console.error('Erro na consulta:', error);
        throw new Error('Erro ao carregar usuários: ' + error.message);
      }

      console.log('Usuários encontrados:', data?.length || 0);
      return data || [];
    } catch (error: any) {
      console.error('Erro completo:', error);
      throw new Error('Erro ao carregar usuários: ' + (error.message || 'Erro desconhecido'));
    }
  },

  async atualizar(id: string, dados: { ativo: boolean }) {
    try {
      const { data, error } = await supabase
        .from('perfis_usuario')
        .update(dados)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar usuário:', error);
        throw new Error('Erro ao atualizar usuário: ' + error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Erro completo:', error);
      throw new Error('Erro ao atualizar usuário: ' + (error.message || 'Erro desconhecido'));
    }
  }
}

// Serviços de Mensagens
export const mensagemService = {
  async enviar(mensagem: any) {
    const { data, error } = await supabase
      .from('mensagens')
      .insert(mensagem)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async listarPorCliente(clienteId: number) {
    const { data, error } = await supabase
      .from('mensagens')
      .select(`
        *,
        cliente:clientes(*),
        colaborador:colaboradores_empresa(*)
      `)
      .eq('cliente_id', clienteId)
      .order('data_envio', { ascending: true })
    
    if (error) throw error
    return data
  },

  async atualizarStatus(id: number, status: string) {
    const { data, error } = await supabase
      .from('mensagens')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Serviços de Cliente
export const clienteService = {
  async criar(cliente: any) {
    const { data, error } = await supabase
      .from('clientes')
      .insert(cliente)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async atualizar(id: number, cliente: any) {
    const { data, error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async buscarPorTelefone(telefone: string) {
    const { data, error } = await supabase
      .from('clientes')
      .select()
      .eq('telefone', telefone)
      .single()
    
    if (error) throw error
    return data
  },

  async listarPorDepartamento(departamentoId: number) {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        especialidade:especialidades_clientes(*),
        atendido_por:colaboradores_empresa(*)
      `)
      .eq('departamento_id', departamentoId)
    
    if (error) throw error
    return data
  }
} 