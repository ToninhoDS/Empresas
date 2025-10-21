import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface CreateUserDTO {
    email: string;
    password: string;
    nome: string;
    cargo: 'admin' | 'supervisor' | 'agent';
    departamentos: string[];
    cartao_ponto?: string;
}

// Interface para o perfil do usuário
export interface UserProfile {
    id: string;
    nome: string;
    email: string;
    cargo: string;
    ativo: boolean;
    cartao_ponto?: string;
    empresa_id: string;
    departamentos?: Array<{
        departamento: {
            id: string;
            nome: string;
        }
    }>;
    isAdminMaster?: boolean;
    primeiro_acesso?: boolean;
    data_criacao?: string;
    data_atualizacao?: string;
    data_ultimo_login?: string;
}

export const userService = {
    // Criar novo usuário
    async createUser(data: CreateUserDTO) {
        // 1. Criar usuário no Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true
        });

        if (authError) throw authError;

        try {
            // 2. Pegar empresa do usuário logado
            const { data: perfilLogado } = await supabase
                .from('perfis_usuario')
                .select('empresa_id')
                .single();

            // 3. Criar perfil do usuário
            const { data: perfil, error: perfilError } = await supabase
                .from('perfis_usuario')
                .insert({
                    id: authData.user.id,
                    empresa_id: perfilLogado.empresa_id,
                    nome: data.nome,
                    cargo: data.cargo,
                    cartao_ponto: data.cartao_ponto
                })
                .select()
                .single();

            if (perfilError) throw perfilError;

            // 4. Associar aos departamentos
            const departamentosInsert = data.departamentos.map(depId => ({
                perfil_usuario_id: authData.user.id,
                departamento_id: depId
            }));

            const { error: depError } = await supabase
                .from('usuario_departamentos')
                .insert(departamentosInsert);

            if (depError) throw depError;

            return perfil;
        } catch (error) {
            // Se algo der errado, deletar o usuário criado
            await supabase.auth.admin.deleteUser(authData.user.id);
            throw error;
        }
    },

    // Listar usuários da empresa
    async listUsers() {
        const { data, error } = await supabase
            .from('perfis_usuario')
            .select(`
                id,
                nome,
                email,
                cargo,
                ativo,
                cartao_ponto,
                departamentos:usuario_departamentos(
                    departamento:departamentos(
                        id,
                        nome
                    )
                )
            `);

        if (error) throw error;
        return data;
    },

    // Atualizar usuário
    async updateUser(id: string, data: Partial<CreateUserDTO>) {
        const { error } = await supabase
            .from('perfis_usuario')
            .update({
                nome: data.nome,
                cargo: data.cargo,
                cartao_ponto: data.cartao_ponto
            })
            .eq('id', id);

        if (error) throw error;

        // Atualizar departamentos se fornecidos
        if (data.departamentos) {
            // Deletar associações antigas
            await supabase
                .from('usuario_departamentos')
                .delete()
                .eq('perfil_usuario_id', id);

            // Inserir novas associações
            const departamentosInsert = data.departamentos.map(depId => ({
                perfil_usuario_id: id,
                departamento_id: depId
            }));

            const { error: depError } = await supabase
                .from('usuario_departamentos')
                .insert(departamentosInsert);

            if (depError) throw depError;
        }
    },

    // Ativar/Desativar usuário
    async toggleUserStatus(id: string, ativo: boolean) {
        const { error } = await supabase
            .from('perfis_usuario')
            .update({ ativo })
            .eq('id', id);

        if (error) throw error;
    },

    // Login e busca de perfil
    async login(email: string, password: string): Promise<UserProfile | null> {
        // 1. Fazer login no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) throw authError;

        // 2. Buscar perfil completo do usuário
        const { data: profile, error: profileError } = await supabase
            .from('perfis_usuario')
            .select(`
                *,
                departamentos:usuario_departamentos(
                    departamento:departamentos(
                        id,
                        nome
                    )
                )
            `)
            .eq('id', authData.user.id)
            .single();

        if (profileError) throw profileError;

        // 3. Verificar se é admin-master (você pode ajustar essa lógica conforme necessário)
        const isAdminMaster = email === 'admin.master@sistema.com' || profile.cargo === 'admin-master';

        // 4. Montar objeto de retorno
        const userProfile: UserProfile = {
            ...profile,
            isAdminMaster
        };

        // 5. Salvar no localStorage
        localStorage.setItem('user', JSON.stringify(userProfile));

        return userProfile;
    },

    // Função para verificar permissões
    hasPermission(requiredRole: string | string[]): boolean {
        const user = localStorage.getItem('user');
        if (!user) return false;

        const userData = JSON.parse(user) as UserProfile;
        
        // Admin-master tem todas as permissões
        if (userData.isAdminMaster) return true;

        // Converter para array se for string única
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

        // Verificar hierarquia de cargos
        switch (userData.cargo) {
            case 'admin':
                return roles.every(role => ['admin', 'supervisor', 'agent'].includes(role));
            case 'supervisor':
                return roles.every(role => ['supervisor', 'agent'].includes(role));
            case 'agent':
                return roles.every(role => ['agent'].includes(role));
            default:
                return false;
        }
    }
};
