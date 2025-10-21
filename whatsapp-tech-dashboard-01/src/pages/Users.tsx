import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from '@/hooks/useAuth';
import { Usuario, Departamento, SubDepartamento, Empresa, userFormSchema, UserFormValues } from '@/types/user';
import {
  UserEditModal,
  UserViewModal,
  UsersTable,
  DeleteUserModal,
  ResetPasswordModal,
  CreateUserModal
} from '@/components/users';

const Users = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [viewingUser, setViewingUser] = useState<Usuario | null>(null);
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [subDepartamentos, setSubDepartamentos] = useState<SubDepartamento[]>([]);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const { user, signUp } = useAuth();
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<Usuario | null>(null);
  const [usuarioParaResetarSenha, setUsuarioParaResetarSenha] = useState<Usuario | null>(null);
  const [novaSenha, setNovaSenha] = useState('');

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      timeCard: '',
      name: '',
      email: '',
      role: '',
      departments: [],
      subdepartments: {},
      password: '',
      status: 'ativo'
    }
  });

  useEffect(() => {
    carregarUsuarios();
    carregarDepartamentos();
    carregarEmpresa();
  }, [user]);

  const carregarUsuarios = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!user?.empresa_id) {
        setError('ID da empresa não encontrado');
        return;
      }

      const { data: usuarios, error: usuariosError } = await supabase
        .from('perfis_usuarios')
        .select('*')
        .eq('empresa_id', user.empresa_id);

      if (usuariosError) throw usuariosError;

      setUsuarios(usuarios || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const carregarDepartamentos = async () => {
    try {
      if (!user?.empresa_id) return;

      const { data: deps, error: depsError } = await supabase
        .from('departamentos')
        .select('id, nome')
        .eq('empresa_id', user.empresa_id);

      if (depsError) throw depsError;

      setDepartamentos(deps || []);

      if (deps && deps.length > 0) {
        const { data: subDeps, error: subDepsError } = await supabase
          .from('sub_departamentos')
          .select('id, nome, departamento_id');

        if (subDepsError) throw subDepsError;

        setSubDepartamentos(subDeps || []);
      }
    } catch (error: any) {
      console.error('Erro ao carregar departamentos:', error);
      toast({
        title: "Erro ao carregar departamentos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const carregarEmpresa = async () => {
    try {
      if (!user?.empresa_id) return;

      const { data: empresaData, error } = await supabase
        .from('empresas')
        .select('id, nome, cnpj')
        .eq('id', user.empresa_id)
        .single();

      if (error) throw error;
      setEmpresa(empresaData);
    } catch (error) {
      console.error('Erro ao carregar empresa:', error);
    }
  };

  const handleAtivarDesativar = async (id: number, ativo: boolean) => {
    try {
      if (!['admin-master', 'admin', 'admim-supervisor'].includes(user?.cargo || '')) {
        throw new Error('Você não tem permissão para ativar/desativar usuários');
      }

      const { error } = await supabase
        .from('perfis_usuarios')
        .update({ ativo: !ativo })
        .eq('id', id);

      if (error) throw error;

      setUsuarios(usuarios.map(u => 
        u.id === id ? { ...u, ativo: !ativo } : u
      ));

      toast({
        title: `Usuário ${!ativo ? 'ativado' : 'desativado'}`,
        description: `O usuário foi ${!ativo ? 'ativado' : 'desativado'} com sucesso.`,
        variant: !ativo ? "default" : "destructive",
      });

    } catch (error: any) {
      console.error('Erro ao ativar/desativar usuário:', error);
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleResetSenha = async (id: number) => {
    try {
      if (!['admin-master', 'admin'].includes(user?.cargo || '')) {
        throw new Error('Você não tem permissão para resetar senhas');
      }

      if (!novaSenha) {
        throw new Error('A nova senha é obrigatória');
      }

      const { data, error } = await supabase.rpc('reset_user_password', {
        user_id: id,
        new_pass: novaSenha
      });

      if (error) throw error;

      if (data && !data.success) {
        throw new Error(data.message || 'Erro ao resetar senha');
      }

      setUsuarioParaResetarSenha(null);
      setNovaSenha('');
      
      await carregarUsuarios();
      
      toast({
        title: "Senha alterada",
        description: "A senha do usuário foi alterada com sucesso. O usuário precisará trocar a senha no próximo login.",
      });
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      toast({
        title: "Erro ao resetar senha",
        description: error.message || 'Erro ao tentar resetar a senha',
        variant: "destructive",
      });
    }
  };

  const verificarCartaoPontoExistente = async (cartaoPonto: string, usuarioId?: number): Promise<boolean> => {
    try {
      let query = supabase
        .from('perfis_usuarios')
        .select('id')
        .eq('cartao_ponto', cartaoPonto)
        .eq('empresa_id', user?.empresa_id);

      if (usuarioId) {
        query = query.neq('id', usuarioId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar cartão de ponto:', error);
      return false;
    }
  };

  const handleExcluir = async (id: number) => {
    try {
      const { error } = await supabase
        .from('perfis_usuarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsuarios(usuarios.filter(u => u.id !== id));
      setUsuarioParaExcluir(null);
      
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const limparFormulario = () => {
    form.reset({
      name: '',
      email: '',
      timeCard: '',
      role: '',
      departments: [],
      subdepartments: {},
      password: '',
      status: 'ativo'
    });
  };

  const handleEditUser = (usuario: Usuario) => {
    limparFormulario();
    setEditingUser(usuario);
    form.reset({
      name: usuario.nome || '',
      email: usuario.email || '',
      timeCard: usuario.cartao_ponto || '',
      role: usuario.cargo || '',
      departments: usuario.departamento_id ? [usuario.departamento_id] : [],
      subdepartments: usuario.sub_departamento_id ? {
        [usuario.departamento_id || '']: [usuario.sub_departamento_id]
      } : {},
      status: usuario.ativo ? 'ativo' : 'inativo'
    });
  };

  const handleUpdateUser = async (values: UserFormValues) => {
    try {
      if (!editingUser) return;

      if (!['admin-master', 'admin', 'admim-supervisor'].includes(user?.cargo || '')) {
        throw new Error('Você não tem permissão para editar usuários');
      }

      const cartaoPontoExiste = await verificarCartaoPontoExistente(values.timeCard, editingUser.id);
      if (cartaoPontoExiste) {
        toast({
          title: "Cartão de ponto já cadastrado",
          description: "Este número de cartão de ponto já está em uso por outro usuário.",
          variant: "destructive",
        });
        return;
      }

      const hasInvalidDepartment = values.departments.some(depId => {
        const subDeps = subDepartamentos.filter(sub => sub.departamento_id === depId);
        return subDeps.length > 0 && (!values.subdepartments[depId] || values.subdepartments[depId].length === 0);
      });

      if (hasInvalidDepartment) {
        toast({
          title: "Validação",
          description: "Selecione pelo menos um subdepartamento para cada departamento que possui subdepartamentos.",
          variant: "destructive",
        });
        return;
      }

      const departamento_id = values.departments[0];
      const sub_departamento_id = values.subdepartments[departamento_id]?.[0];

      const updateData = {
        nome: values.name,
        email: values.email,
        cartao_ponto: values.timeCard,
        cargo: values.role,
        departamento_id: departamento_id || null,
        sub_departamento_id: sub_departamento_id || null,
        ativo: values.status === 'ativo'
      };

      const { error } = await supabase
        .from('perfis_usuarios')
        .update(updateData)
        .eq('id', editingUser.id);

      if (error) throw error;

      toast({
        title: "Usuário atualizado",
        description: "As alterações foram salvas com sucesso",
      });

      setEditingUser(null);
      carregarUsuarios();
    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = async (values: UserFormValues) => {
    try {
      if (!user?.empresa_id) {
        throw new Error('ID da empresa não encontrado');
      }

      if (!['admin-master', 'admin', 'admim-supervisor'].includes(user?.cargo || '')) {
        throw new Error('Você não tem permissão para criar usuários');
      }

      const cartaoPontoExiste = await verificarCartaoPontoExistente(values.timeCard);
      if (cartaoPontoExiste) {
        toast({
          title: "Cartão de ponto já cadastrado",
          description: "Este número de cartão de ponto já está em uso por outro usuário.",
          variant: "destructive",
        });
        return;
      }

      const hasInvalidDepartment = values.departments.some(depId => {
        const subDeps = subDepartamentos.filter(sub => sub.departamento_id === depId);
        return subDeps.length > 0 && (!values.subdepartments[depId] || values.subdepartments[depId].length === 0);
      });

      if (hasInvalidDepartment) {
        toast({
          title: "Validação",
          description: "Selecione pelo menos um subdepartamento para cada departamento que possui subdepartamentos.",
          variant: "destructive",
        });
        return;
      }

      const departamento_id = values.departments[0];
      const sub_departamento_id = values.subdepartments[departamento_id]?.[0];

      const response = await signUp(
        values.name,
        values.email,
        values.password || '123456',
        values.role,
        values.timeCard,
        parseInt(user.empresa_id),
        departamento_id,
        sub_departamento_id
      );

      if (!response.success) {
        throw new Error(response.message || 'Erro ao criar usuário');
      }

      toast({
        title: "Usuário criado com sucesso",
        description: "O novo usuário foi adicionado ao sistema.",
      });

      setShowNewUserDialog(false);
      carregarUsuarios();
      form.reset();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.cartao_ponto.includes(searchTerm)
  );

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">Você precisa estar logado para acessar esta página.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Carregando usuários...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar novamente
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              limparFormulario();
              setShowNewUserDialog(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários do Sistema</CardTitle>
            <CardDescription>
              Gerencie os usuários e suas permissões no sistema de WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center">
              <Search className="mr-2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
                autoComplete="off"
              />
            </div>

            <UsersTable
              usuarios={filteredUsuarios}
              departamentos={departamentos}
              subDepartamentos={subDepartamentos}
              onViewUser={setViewingUser}
              onEditUser={handleEditUser}
              onDeleteUser={setUsuarioParaExcluir}
              onResetPassword={setUsuarioParaResetarSenha}
              onToggleActive={handleAtivarDesativar}
            />
          </CardContent>
        </Card>

        <UserEditModal
          editingUser={editingUser}
          form={form}
          departamentos={departamentos}
          subDepartamentos={subDepartamentos}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdateUser}
        />

        <UserViewModal
          viewingUser={viewingUser}
          departamentos={departamentos}
          subDepartamentos={subDepartamentos}
          onClose={() => setViewingUser(null)}
          onEdit={handleEditUser}
        />

        <DeleteUserModal
          usuarioParaExcluir={usuarioParaExcluir}
          onClose={() => setUsuarioParaExcluir(null)}
          onConfirm={handleExcluir}
        />

        <ResetPasswordModal
          usuarioParaResetarSenha={usuarioParaResetarSenha}
          novaSenha={novaSenha}
          onSenhaChange={setNovaSenha}
          onClose={() => {
            setUsuarioParaResetarSenha(null);
            setNovaSenha('');
          }}
          onConfirm={handleResetSenha}
        />

        <CreateUserModal
          showDialog={showNewUserDialog}
          form={form}
          departamentos={departamentos}
          subDepartamentos={subDepartamentos}
          empresa={empresa}
          onClose={() => {
            setShowNewUserDialog(false);
            limparFormulario();
          }}
          onSubmit={handleCreateUser}
        />
      </div>
    </DashboardLayout>
  );
};

export default Users;
