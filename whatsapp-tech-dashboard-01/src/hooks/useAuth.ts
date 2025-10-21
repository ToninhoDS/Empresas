import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  nome: string
  email: string
  cargo: string
  empresa_id: string
  primeiro_acesso: boolean
  reset_senha: boolean
  cartao_ponto: string
  ativo: boolean
}

interface AuthResponse {
  success: boolean
  message: string
  user?: User
  token?: string
  requirePasswordChange?: boolean
}

export interface UseAuth {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResponse>
  showChangePasswordModal: boolean
  setShowChangePasswordModal: React.Dispatch<React.SetStateAction<boolean>>
  signUp: (
    nome: string,
    email: string,
    senha: string,
    cargo: string,
    cartaoPonto: string,
    empresaId: number,
    departamentoId: number | null,
    subDepartamentoId: number | null
  ) => Promise<AuthResponse>
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)

  // Função para verificar se o usuário precisa trocar a senha
  const checkPasswordChange = (userData: User) => {
    return userData.primeiro_acesso || userData.reset_senha;
  };

  useEffect(() => {
    // Verifica se há um usuário no localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      // Verificar se precisa trocar a senha
      setShowChangePasswordModal(checkPasswordChange(parsedUser))
    }
    setLoading(false)
  }, [])

  // Efeito para atualizar o estado do modal quando o usuário mudar
  useEffect(() => {
    if (user) {
      setShowChangePasswordModal(checkPasswordChange(user))
    }
  }, [user])

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // Primeiro, verificar se o usuário existe e está ativo
      const { data: userData, error: userError } = await supabase
        .from('perfis_usuarios')
        .select('ativo')
        .eq('email', email)
        .single();

      if (userError) {
        console.error('Erro ao verificar usuário:', userError);
        throw new Error('Email ou senha incorretos');
      }

      if (userData && !userData.ativo) {
        throw new Error('Usuário desativado. Entre em contato com o administrador do sistema.');
      }

      // Se o usuário estiver ativo, prosseguir com o login
      const { data, error } = await supabase.rpc('login_usuario', {
        p_email: email,
        p_senha: password
      });

      if (error) {
        console.error('Erro no login:', error);
        throw new Error(error.message || 'Credenciais inválidas');
      }

      // Se não houver dados ou o login não foi bem sucedido
      if (!data || !data.success) {
        throw new Error('Email ou senha incorretos');
      }

      if (data.success && data.user) {
        // Salvar usuário no localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setUser(data.user);

        return {
          ...data,
          requirePasswordChange: checkPasswordChange(data.user)
        };
      }

      return data as AuthResponse;
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      if (!user) throw new Error('Usuário não encontrado');

      const { data, error } = await supabase.rpc('change_user_password', {
        p_user_id: user.id,
        p_current_password: currentPassword,
        p_new_password: newPassword
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.message);
      }

      // Atualizar o usuário no estado e localStorage
      const updatedUser = {
        ...user,
        primeiro_acesso: false,
        reset_senha: false
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowChangePasswordModal(false);

      return true;
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    }
  };

  const signOut = async () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setShowChangePasswordModal(false)
  }

  const signUp = async (
    nome: string,
    email: string,
    senha: string,
    cargo: string,
    cartaoPonto: string,
    empresaId: number,
    departamentoId: number | null,
    subDepartamentoId: number | null
  ): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.rpc('criar_usuario', {
        p_nome: nome,
        p_email: email,
        p_senha: senha,
        p_cargo: cargo,
        p_cartao_ponto: cartaoPonto,
        p_empresa_id: empresaId,
        p_departamento_id: departamentoId,
        p_sub_departamento_id: subDepartamentoId
      });

      if (error) {
        console.error('Erro ao criar usuário:', error);
        throw new Error(error.message);
      }

      if (!data || !data.success) {
        throw new Error(data?.message || 'Erro ao criar usuário');
      }

      return {
        success: true,
        message: 'Usuário criado com sucesso',
        user: data.user
      };
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      return {
        success: false,
        message: error.message || 'Erro ao criar usuário'
      };
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    changePassword,
    showChangePasswordModal,
    setShowChangePasswordModal,
    signUp
  }
} 