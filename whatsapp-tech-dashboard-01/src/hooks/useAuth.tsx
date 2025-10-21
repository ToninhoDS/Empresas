import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { toast } from '@/hooks/use-toast';
import SecurityModal from '@/components/modals/SecurityModal';

interface User {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  empresa_id: string;
  reset_senha: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (
    name: string,
    email: string,
    password: string,
    role: string,
    timeCard: string,
    empresa_id: string,
    departamento_id?: string,
    sub_departamento_id?: string
  ) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: userData, error: userError } = await supabase
          .from('perfis_usuario')
          .select('*')
          .eq('email', authUser.email)
          .single();

        if (userError) throw userError;

        setUser(userData);

        // Verificar se precisa mostrar o modal de segurança
        if (userData.reset_senha) {
          setShowSecurityModal(true);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: userData, error: userError } = await supabase
        .from('perfis_usuario')
        .select('*')
        .eq('email', email)
        .single();

      if (userError) throw userError;

      // Atualizar data do último login
      await supabase
        .from('perfis_usuario')
        .update({ data_ultimo_login: new Date().toISOString() })
        .eq('id', userData.id);

      setUser(userData);

      // Verificar se precisa mostrar o modal de segurança
      if (userData.reset_senha) {
        setShowSecurityModal(true);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      return {
        success: false,
        message: error.message || 'Erro ao fazer login'
      };
    }
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    role: string,
    timeCard: string,
    empresa_id: string,
    departamento_id?: string,
    sub_departamento_id?: string
  ) => {
    try {
      // Criar usuário no auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('perfis_usuario')
        .insert([
          {
            nome: name,
            email,
            cartao_ponto: timeCard,
            cargo: role,
            empresa_id,
            departamento_id,
            sub_departamento_id,
            senha_hash: password,
            senha_login: password,
            ativo: true,
            primeiro_acesso: true,
            reset_senha: false
          }
        ]);

      if (profileError) throw profileError;

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      return {
        success: false,
        message: error.message || 'Erro ao criar usuário'
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
      {showSecurityModal && user && (
        <SecurityModal
          isOpen={showSecurityModal}
          userId={user.id}
          onClose={() => setShowSecurityModal(false)}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 