-- Habilitar a extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipos ENUM personalizados
CREATE TYPE user_role AS ENUM ('admin-master', 'admin', 'admim-supervisor', 'supervisor','supervisor-agent', 'agent');
CREATE TYPE empresa_status AS ENUM ('ativa', 'inativa', 'trial');
CREATE TYPE dominio_status AS ENUM ('ativo', 'inativo');
CREATE TYPE vps_status AS ENUM ('ativo', 'inativo');
CREATE TYPE plano_tipo AS ENUM ('Básico', 'Premium', 'Empresarial', 'Custom');
CREATE TYPE plano_status AS ENUM ('Ativo', 'Expirado', 'Pendente');
CREATE TYPE aviso_tipo AS ENUM ('Destaque', 'Base', 'Adicional');
CREATE TYPE kanban_status AS ENUM ('ativo', 'inativo');
CREATE TYPE tema_modo AS ENUM ('dark', 'light');
CREATE TYPE mensagem_tipo AS ENUM ('texto', 'imagem', 'audio', 'video', 'documento', 'localizacao');
CREATE TYPE mensagem_direcao AS ENUM ('entrada', 'saida');
CREATE TYPE mensagem_status AS ENUM ('enviada', 'entregue', 'lida', 'nao_lida', 'aguardando', 'finalizada');
CREATE TYPE chat_tipo AS ENUM ('individual', 'grupo');

-- Tabela de Empresas
CREATE TABLE empresas (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    endereco TEXT,
    status empresa_status DEFAULT 'ativa',
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    nome_dominio VARCHAR(255),
    status_dominio dominio_status DEFAULT 'ativo',
    dominio_data_inicio DATE,
    dominio_data_expira DATE,
    dominio_descricao TEXT,
    vps_nome VARCHAR(255),
    vps_status vps_status DEFAULT 'ativo',
    vps_data_inicio DATE,
    vps_data_expira DATE,
    vps_descricao TEXT,
    licenca_tipo VARCHAR(255),
    licenca_data_inicio DATE,
    licenca_data_expira DATE,
    licenca_descricao TEXT
);

-- Tabela de Perfis de Usuário (estende a auth.users do Supabase)
CREATE TABLE perfis_usuario (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    empresa_id uuid REFERENCES empresas ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL, -- Email do usuário (sincronizado com auth.users)
    telefone VARCHAR(20),
    cartao_ponto VARCHAR(6),
    cargo user_role NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    senha_login VARCHAR(50),
    primeiro_acesso BOOLEAN DEFAULT TRUE, -- Indica se é o primeiro acesso do usuário
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_ultimo_login TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_email_auth_users FOREIGN KEY (email) REFERENCES auth.users(email)
);

-- Tabela de Funções
CREATE TABLE funcoes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
);

-- Tabela de Departamentos
CREATE TABLE departamentos (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    empresa_id uuid REFERENCES empresas ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    logotipo VARCHAR(255),
    status kanban_status DEFAULT 'ativo',
    UNIQUE(empresa_id, nome)
);

-- Tabela de Subdepartamentos
CREATE TABLE sub_departamentos (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    departamento_id uuid REFERENCES departamentos ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    status kanban_status DEFAULT 'ativo',
    UNIQUE(departamento_id, nome)
);

-- Tabela de Configuração do Sistema
CREATE TABLE configuracao_sistema (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    empresa_id uuid REFERENCES empresas ON DELETE CASCADE,
    dark_ligth_mode tema_modo DEFAULT 'light',
    novas_mensagem BOOLEAN DEFAULT TRUE,
    mensagens_internas BOOLEAN DEFAULT TRUE,
    atualizacoes_sistema BOOLEAN DEFAULT TRUE,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Preferências do Usuário
CREATE TABLE preferencias_usuario (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id uuid REFERENCES perfis_usuario ON DELETE CASCADE,
    dark_ligth_mode tema_modo DEFAULT NULL,
    novas_mensagem BOOLEAN DEFAULT NULL,
    mensagens_internas BOOLEAN DEFAULT NULL,
    atualizacoes_sistema BOOLEAN DEFAULT NULL,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Planos de Contratos
CREATE TABLE planos_contratos (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    empresa_id uuid REFERENCES empresas ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    subtitulo VARCHAR(255),
    texto_destaque TEXT,
    tipo_plano plano_tipo DEFAULT 'Básico',
    status plano_status DEFAULT 'Ativo',
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Detalhes dos Planos
CREATE TABLE planos_detalhes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    plano_id uuid REFERENCES planos_contratos ON DELETE CASCADE,
    descricao TEXT NOT NULL
);

-- Tabela de Avisos dos Planos
CREATE TABLE planos_avisos (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    plano_id uuid REFERENCES planos_contratos ON DELETE CASCADE,
    tipo_aviso aviso_tipo DEFAULT 'Adicional',
    descricao TEXT NOT NULL
);

-- Tabela de Kanban
CREATE TABLE kanban_colunas (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    sub_departamento_id uuid REFERENCES sub_departamentos ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    icon VARCHAR(150) NOT NULL,
    ordem INT NOT NULL,
    status kanban_status DEFAULT 'ativo'
);

-- Tabela de Contatos do Kanban
CREATE TABLE kanban_contatos (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    sub_departamento_id uuid REFERENCES sub_departamentos ON DELETE CASCADE,
    coluna_id uuid REFERENCES kanban_colunas ON DELETE CASCADE,
    contato_id uuid NOT NULL,
    favorito BOOLEAN DEFAULT FALSE,
    ordem INT NOT NULL,
    lembrete TIMESTAMP WITH TIME ZONE,
    colaborador_id uuid REFERENCES perfis_usuario ON DELETE SET NULL,
    status_etiqueta VARCHAR(155),
    texto_lembrete TEXT
);

-- Tabela de Especialidades de Clientes
CREATE TABLE especialidades_clientes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) UNIQUE NOT NULL
);

-- Tabela de Clientes
CREATE TABLE clientes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    departamento_id uuid REFERENCES departamentos ON DELETE CASCADE,
    nome VARCHAR(255),
    telefone VARCHAR(20) UNIQUE NOT NULL,
    especialidade_id uuid REFERENCES especialidades_clientes ON DELETE SET NULL,
    ultima_interacao TIMESTAMP WITH TIME ZONE,
    atendido_por uuid REFERENCES perfis_usuario ON DELETE SET NULL,
    status_cliente kanban_status DEFAULT 'ativo'
);

-- Tabela de Endereços de Clientes
CREATE TABLE enderecos_cliente (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    cliente_id uuid REFERENCES clientes ON DELETE CASCADE,
    endereco TEXT NOT NULL
);

-- Tabela de Mensagens
CREATE TABLE mensagens (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    cliente_id uuid REFERENCES clientes ON DELETE CASCADE,
    colaborador_id uuid REFERENCES perfis_usuario ON DELETE SET NULL,
    departamento_id uuid REFERENCES departamentos ON DELETE SET NULL,
    sub_departamento_id uuid REFERENCES sub_departamentos ON DELETE SET NULL,
    conteudo TEXT NOT NULL,
    tipo mensagem_tipo DEFAULT 'texto',
    direcao mensagem_direcao NOT NULL,
    status mensagem_status DEFAULT 'enviada',
    data_envio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Status das Mensagens
CREATE TABLE status_mensagem (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    cliente_id uuid REFERENCES clientes ON DELETE CASCADE,
    mensagem_id uuid REFERENCES mensagens ON DELETE SET NULL,
    status mensagem_status NOT NULL,
    alterado_por uuid REFERENCES perfis_usuario ON DELETE SET NULL,
    data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tags
CREATE TABLE tags (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) UNIQUE NOT NULL,
    descricao TEXT
);

-- Tabela de Tags dos Clientes
CREATE TABLE clientes_tags (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    cliente_id uuid REFERENCES clientes ON DELETE CASCADE,
    tag_id uuid REFERENCES tags ON DELETE CASCADE,
    alterado_por uuid REFERENCES perfis_usuario ON DELETE SET NULL,
    data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Chat Interno
CREATE TABLE chat_interno (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    remetente_id uuid REFERENCES perfis_usuario ON DELETE CASCADE,
    destinatario_id uuid REFERENCES perfis_usuario ON DELETE SET NULL,
    departamento_id uuid REFERENCES departamentos ON DELETE SET NULL,
    sub_departamento_id uuid REFERENCES sub_departamentos ON DELETE SET NULL,
    mensagem TEXT NOT NULL,
    tipo_conversa chat_tipo DEFAULT 'individual',
    urgente BOOLEAN DEFAULT FALSE,
    data_envio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Arquivos
CREATE TABLE arquivos (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    mensagem_id uuid REFERENCES mensagens ON DELETE CASCADE,
    nome_arquivo VARCHAR(255) NOT NULL,
    tipo_arquivo VARCHAR(50),
    tamanho BIGINT,
    url VARCHAR(255),
    data_upload TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Mensagens Prontas (Templates)
CREATE TABLE mensagens_prontas (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    departamento_id uuid REFERENCES departamentos ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    criado_por uuid REFERENCES perfis_usuario ON DELETE SET NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela principal de avisos do sistema
CREATE TABLE avisos_sistemas_config (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    empresa_id uuid REFERENCES empresas ON DELETE CASCADE,
    data_ultima_alteracao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para Manutenção Urgente
CREATE TABLE manu_urgente_config (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    aviso_id uuid REFERENCES avisos_sistemas_config ON DELETE CASCADE,
    titulo VARCHAR(50) NOT NULL DEFAULT 'Manutenção Urgente',
    texto TEXT NOT NULL,
    data_evento DATE NOT NULL,
    hora_evento TIME NOT NULL
);

-- Tabela para Novas Funcionalidades
CREATE TABLE update_novidade_config (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    aviso_id uuid REFERENCES avisos_sistemas_config ON DELETE CASCADE,
    titulo VARCHAR(50) NOT NULL DEFAULT 'Nova Funcionalidade',
    texto TEXT NOT NULL,
    data_evento DATE NOT NULL,
    hora_evento TIME NOT NULL
);

-- Tabela para Anomalias Detectadas
CREATE TABLE anomalias_dec_config (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    aviso_id uuid REFERENCES avisos_sistemas_config ON DELETE CASCADE,
    titulo VARCHAR(50) NOT NULL DEFAULT 'Anomalia Detectada',
    texto TEXT NOT NULL,
    data_evento DATE NOT NULL,
    hora_evento TIME NOT NULL
);

-- Tabela para Atualizações do Sistema
CREATE TABLE update_sistema_config (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    aviso_id uuid REFERENCES avisos_sistemas_config ON DELETE CASCADE,
    titulo VARCHAR(50) NOT NULL DEFAULT 'Atualização do Sistema',
    texto TEXT NOT NULL,
    data_evento DATE NOT NULL,
    hora_evento TIME NOT NULL
);

-- Tabela principal para reportar problemas no sistema
CREATE TABLE report_problema_sistem (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    empresa_id uuid REFERENCES empresas ON DELETE CASCADE,
    data_ultima_alteracao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para relatar bugs no sistema
CREATE TABLE bug_report_sistem (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id uuid REFERENCES report_problema_sistem ON DELETE CASCADE,
    titulo_problema VARCHAR(255) NOT NULL,
    descricao_detalhe TEXT NOT NULL,
    data_aviso DATE NOT NULL,
    hora_aviso TIME NOT NULL
);

-- Tabela para relatar erros de funções do sistema
CREATE TABLE erro_funcoes_report (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id uuid REFERENCES report_problema_sistem ON DELETE CASCADE,
    titulo_problema VARCHAR(255) NOT NULL,
    descricao_detalhe TEXT NOT NULL,
    data_aviso DATE NOT NULL,
    hora_aviso TIME NOT NULL
);

-- Índices
CREATE INDEX idx_cliente_telefone ON clientes(telefone);
CREATE INDEX idx_mensagens_data ON mensagens(data_envio);
CREATE INDEX idx_mensagens_status ON mensagens(status);
CREATE INDEX idx_status_mensagem ON status_mensagem(cliente_id, status);

-- Políticas de Segurança RLS

-- Política para empresas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias empresas"
ON empresas FOR SELECT
USING (
    auth.uid() IN (
        SELECT id FROM perfis_usuario 
        WHERE empresa_id = empresas.id
    )
);

CREATE POLICY "Apenas admin-master pode criar empresas"
ON empresas FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM perfis_usuario
        WHERE id = auth.uid()
        AND cargo = 'admin-master'
    )
);

-- Política para perfis de usuário
ALTER TABLE perfis_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver perfis da mesma empresa"
ON perfis_usuario FOR SELECT
USING (
    empresa_id IN (
        SELECT empresa_id FROM perfis_usuario
        WHERE id = auth.uid()
    )
);

CREATE POLICY "Apenas admin pode gerenciar usuários"
ON perfis_usuario FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM perfis_usuario
        WHERE id = auth.uid()
        AND (cargo = 'admin-master' OR cargo = 'admin')
    )
);

-- Política para clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver clientes do seu departamento"
ON clientes FOR SELECT
USING (
    departamento_id IN (
        SELECT d.id FROM departamentos d
        JOIN perfis_usuario p ON d.empresa_id = p.empresa_id
        WHERE p.id = auth.uid()
    )
);

-- Política para mensagens
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver mensagens do seu departamento"
ON mensagens FOR SELECT
USING (
    departamento_id IN (
        SELECT d.id FROM departamentos d
        JOIN perfis_usuario p ON d.empresa_id = p.empresa_id
        WHERE p.id = auth.uid()
    )
);

-- Política para chat interno
ALTER TABLE chat_interno ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver mensagens do chat interno"
ON chat_interno FOR SELECT
USING (
    remetente_id = auth.uid() OR
    destinatario_id = auth.uid() OR
    departamento_id IN (
        SELECT d.id FROM departamentos d
        JOIN perfis_usuario p ON d.empresa_id = p.empresa_id
        WHERE p.id = auth.uid()
    )
);

-- Funções e Triggers

-- Função para sincronizar email entre auth.users e perfis_usuario
CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS trigger AS $$
BEGIN
    -- Atualiza o email em perfis_usuario quando mudar em auth.users
    UPDATE public.perfis_usuario
    SET email = NEW.email
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para sincronizar email
CREATE TRIGGER sync_user_email_trigger
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_email();

-- Função para criar perfil de usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.perfis_usuario (
        id, 
        nome, 
        email,
        cargo,
        primeiro_acesso
    )
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'nome', new.email), 
        new.email,
        'agent',
        TRUE
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar timestamp em empresas
CREATE TRIGGER update_empresa_modtime
    BEFORE UPDATE ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar timestamp em perfis_usuario
CREATE TRIGGER update_perfil_modtime
    BEFORE UPDATE ON perfis_usuario
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para configurar o primeiro admin-master
CREATE OR REPLACE FUNCTION public.setup_first_admin_master()
RETURNS void AS $$
DECLARE
    v_empresa_id uuid;
    v_admin_id uuid;
BEGIN
    -- Verifica se já existe uma empresa
    SELECT id INTO v_empresa_id FROM empresas LIMIT 1;
    
    IF v_empresa_id IS NULL THEN
        -- Cria a primeira empresa se não existir
        INSERT INTO empresas (
            nome,
            status,
            data_criacao,
            data_atualizacao
        ) VALUES (
            'Empresa Principal',
            'ativa',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        ) RETURNING id INTO v_empresa_id;
    END IF;

    -- Verifica se já existe um admin-master
    SELECT id INTO v_admin_id FROM perfis_usuario 
    WHERE cargo = 'admin-master' LIMIT 1;

    IF v_admin_id IS NULL THEN
        -- Atualiza o perfil do usuário atual para admin-master
        UPDATE perfis_usuario
        SET 
            empresa_id = v_empresa_id,
            cargo = 'admin-master',
            primeiro_acesso = FALSE,
            data_atualizacao = CURRENT_TIMESTAMP
        WHERE id = auth.uid();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário é admin-master
CREATE OR REPLACE FUNCTION public.is_admin_master()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM perfis_usuario
        WHERE id = auth.uid()
        AND cargo = 'admin-master'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política para permitir que o primeiro usuário configure o admin-master
CREATE POLICY "Permitir configuração do primeiro admin-master"
ON perfis_usuario FOR UPDATE
USING (
    (SELECT COUNT(*) FROM perfis_usuario WHERE cargo = 'admin-master') = 0
    AND id = auth.uid()
    AND primeiro_acesso = TRUE
)
WITH CHECK (
    cargo = 'admin-master'
    AND empresa_id IS NOT NULL
    AND primeiro_acesso = FALSE
);

-- Função para criar novo usuário interno
CREATE OR REPLACE FUNCTION public.criar_usuario_interno(
    p_nome VARCHAR(255),
    p_email VARCHAR(255),
    p_senha VARCHAR(255),
    p_cartao_ponto VARCHAR(6),
    p_cargo user_role,
    p_empresa_id uuid
)
RETURNS uuid AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Verifica se o usuário atual é admin-master ou admin
    IF NOT EXISTS (
        SELECT 1 FROM perfis_usuario 
        WHERE id = auth.uid() 
        AND (cargo = 'admin-master' OR cargo = 'admin')
    ) THEN
        RAISE EXCEPTION 'Apenas administradores podem criar usuários';
    END IF;

    -- Cria o usuário no auth.users
    INSERT INTO auth.users (
        email,
        encrypted_password,
        raw_user_meta_data
    ) VALUES (
        p_email,
        crypt(p_senha, gen_salt('bf')),
        jsonb_build_object(
            'nome', p_nome,
            'cartao_ponto', p_cartao_ponto
        )
    ) RETURNING id INTO v_user_id;

    -- Cria o perfil do usuário
    INSERT INTO perfis_usuario (
        id,
        empresa_id,
        nome,
        email,
        cartao_ponto,
        cargo,
        primeiro_acesso
    ) VALUES (
        v_user_id,
        p_empresa_id,
        p_nome,
        p_email,
        p_cartao_ponto,
        p_cargo,
        TRUE
    );

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política para permitir que admins criem usuários
CREATE POLICY "Admins podem criar usuários"
ON perfis_usuario FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM perfis_usuario
        WHERE id = auth.uid()
        AND (cargo = 'admin-master' OR cargo = 'admin')
    )
); 