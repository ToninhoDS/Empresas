-- Estrutura aprimorada do banco de dados para o sistema WhatsAppTech

CREATE DATABASE whatsapptech;
USE whatsapptech;

-- Tabela de Empresas
CREATE TABLE empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    endereco TEXT,
    status ENUM('ativa', 'inativa', 'trial') DEFAULT 'ativa',
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nome_dominio VARCHAR(255),
    status_dominio ENUM('ativo', 'inativo') DEFAULT 'ativo',
    dominio_data_inicio DATE,
    dominio_data_expira DATE,
    dominio_descricao TEXT,
    vps_nome VARCHAR(255),
    vps_status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    vps_data_inicio DATE,
    vps_data_expira DATE,
    vps_descricao TEXT,
    licenca_tipo VARCHAR(255),
    licenca_data_inicio DATE,
    licenca_data_expira DATE,
    licenca_descricao TEXT
);

-- Tabela de Administradores Mestres da Empresa (Admin Master)
CREATE TABLE admin_master_empresa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cartao_ponto VARCHAR(6) UNIQUE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    cargo ENUM('admin-master') DEFAULT 'admin-master' NOT NULL, -- Cargo fixo
    data_ultimo_login TIMESTAMP NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- Tabela de Administradores do Sistema (Criados pelo Admin Master)
CREATE TABLE administradores_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cartao_ponto VARCHAR(6) UNIQUE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    cargo ENUM('admin') DEFAULT 'admin' NOT NULL, -- Cargo fixo
    data_ultimo_login TIMESTAMP NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- Tabela de Funções dos Colaboradores
CREATE TABLE funcoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
);

-- Tabela de Colaboradores (Cargos Editáveis)
CREATE TABLE colaboradores_empresa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    admin_sistema_id INT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cargo VARCHAR(100) NOT NULL, -- Cargo pode ser alterado
    ativo BOOLEAN DEFAULT TRUE,
    data_contratacao DATE,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_sistema_id) REFERENCES administradores_sistema(id) ON DELETE SET NULL
);  

-- Tabela de Departamentos
CREATE TABLE departamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    logotipo VARCHAR(255),
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- Tabela de Subdepartamentos
CREATE TABLE sub_departamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    departamento_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE
);

-- Tabela de Especialidades de Clientes
CREATE TABLE especialidades_clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) UNIQUE NOT NULL
);

-- Tabela de Clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    departamento_id INT NOT NULL,
    nome VARCHAR(255),
    telefone VARCHAR(20) UNIQUE NOT NULL,
    especialidade_id INT NULL,
    ultima_interacao DATETIME,
    atendido_especialista INT NULL,
    status_cliente ENUM('ativo', 'inativo') DEFAULT 'ativo',
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (atendido_especialista) REFERENCES colaboradores_empresa(id) ON DELETE SET NULL,
    FOREIGN KEY (especialidade_id) REFERENCES especialidades_clientes(id) ON DELETE SET NULL
);

-- Tabela de Endereços de Clientes
CREATE TABLE enderecos_cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    endereco TEXT NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Tabela de Mensagens
CREATE TABLE mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    colaborador_id INT NULL,
    departamento_id INT NULL,  -- Alterado para permitir NULL
    sub_departamento_id INT NULL,
    conteudo TEXT NOT NULL,
    tipo ENUM('texto', 'imagem', 'audio', 'video', 'documento', 'localizacao') DEFAULT 'texto',
    direcao ENUM('entrada', 'saida') NOT NULL,
    status ENUM('enviada', 'entregue', 'lida', 'nao_lida', 'aguardando', 'finalizada') DEFAULT 'enviada',
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores_empresa(id) ON DELETE SET NULL,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE SET NULL,  -- Mantido SET NULL
    FOREIGN KEY (sub_departamento_id) REFERENCES sub_departamentos(id) ON DELETE SET NULL
);


-- Tabela de Status das Mensagens
CREATE TABLE status_mensagem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    mensagem_id INT NULL,
    status ENUM('não lida', 'aguardando', 'finalizada') NOT NULL,
    alterado_por INT NULL,  -- Alterado para permitir NULL
    data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (mensagem_id) REFERENCES mensagens(id) ON DELETE SET NULL,
    FOREIGN KEY (alterado_por) REFERENCES colaboradores_empresa(id) ON DELETE SET NULL
);

-- Tabela de Tags
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) UNIQUE NOT NULL,
    descricao TEXT NULL
);

-- Tabela de Tags dos Clientes
CREATE TABLE clientes_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    tag_id INT NOT NULL,
    alterado_por INT NULL,  -- Alterado para permitir NULL
    data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    FOREIGN KEY (alterado_por) REFERENCES colaboradores_empresa(id) ON DELETE SET NULL
);

-- Tabela de Chat Interno
CREATE TABLE chat_interno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remetente_id INT NOT NULL,
    destinatario_id INT NULL,
    departamento_id INT NULL,
    sub_departamento_id INT NULL,
    mensagem TEXT NOT NULL,
    tipo_conversa ENUM('individual', 'grupo') DEFAULT 'individual',
    urgente BOOLEAN DEFAULT FALSE,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remetente_id) REFERENCES colaboradores_empresa(id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES colaboradores_empresa(id) ON DELETE SET NULL,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE SET NULL,
    FOREIGN KEY (sub_departamento_id) REFERENCES sub_departamentos(id) ON DELETE SET NULL
);

-- Tabela de Arquivos
CREATE TABLE arquivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mensagem_id INT NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    tipo_arquivo VARCHAR(50),
    tamanho BIGINT,
    url VARCHAR(255),
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mensagem_id) REFERENCES mensagens(id) ON DELETE CASCADE
);

-- Tabela de Mensagens Prontas (Templates)
CREATE TABLE mensagens_prontas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    departamento_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    criado_por INT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (criado_por) REFERENCES colaboradores_empresa(id) ON DELETE SET NULL
);

---------------------------------------------------------------------------------------
-- Tabela principal de avisos do sistema
CREATE TABLE avisos_sistemas_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    data_ultima_alteracao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- Tabela para Manutenção Urgente
CREATE TABLE manu_urgente_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aviso_id INT NOT NULL,
    titulo VARCHAR(50) NOT NULL DEFAULT 'Manutenção Urgente',
    texto TEXT NOT NULL,
    data_evento DATE NOT NULL,
    hora_evento TIME NOT NULL,
    FOREIGN KEY (aviso_id) REFERENCES avisos_sistemas_config(id) ON DELETE CASCADE
);


---------------------------------------------------------------------------------------
-- Tabela para Novas Funcionalidades
CREATE TABLE update_novidade_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aviso_id INT NOT NULL,
    titulo VARCHAR(50) NOT NULL DEFAULT 'Nova Funcionalidade',
    texto TEXT NOT NULL,
    data_evento DATE NOT NULL,
    hora_evento TIME NOT NULL,
    FOREIGN KEY (aviso_id) REFERENCES avisos_sistemas_config(id) ON DELETE CASCADE
);

-- Tabela para Anomalias Detectadas
CREATE TABLE anomalias_dec_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aviso_id INT NOT NULL,
    titulo VARCHAR(50) NOT NULL DEFAULT 'Anomalia Detectada',
    texto TEXT NOT NULL,
    data_evento DATE NOT NULL,
    hora_evento TIME NOT NULL,
    FOREIGN KEY (aviso_id) REFERENCES avisos_sistemas_config(id) ON DELETE CASCADE
);

-- Tabela para Atualizações do Sistema
CREATE TABLE update_sistema_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aviso_id INT NOT NULL,
    titulo VARCHAR(50) NOT NULL DEFAULT 'Atualização do Sistema',
    texto TEXT NOT NULL,
    data_evento DATE NOT NULL,
    hora_evento TIME NOT NULL,
    FOREIGN KEY (aviso_id) REFERENCES avisos_sistemas_config(id) ON DELETE CASCADE
);

-- Tabela principal para reportar problemas no sistema
CREATE TABLE report_problema_sistem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    data_ultima_alteracao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- Tabela para relatar bugs no sistema
CREATE TABLE bug_report_sistem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    titulo_problema VARCHAR(255) NOT NULL,
    descricao_detalhe TEXT NOT NULL,
    data_aviso DATE NOT NULL,
    hora_aviso TIME NOT NULL,
    FOREIGN KEY (report_id) REFERENCES report_problema_sistem(id) ON DELETE CASCADE
);

-- Tabela para relatar erros de funções do sistema
CREATE TABLE erro_funcoes_report (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    titulo_problema VARCHAR(255) NOT NULL,
    descricao_detalhe TEXT NOT NULL,
    data_aviso DATE NOT NULL,
    hora_aviso TIME NOT NULL,
    FOREIGN KEY (report_id) REFERENCES report_problema_sistem(id) ON DELETE CASCADE
);

-- Tabela de Configuração do Sistema    
CREATE TABLE configuracao_sistema (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    dark_ligth_mode ENUM('dark', 'light') DEFAULT 'light', -- Modo de tema
    novas_mensagem BOOLEAN DEFAULT NULL, -- Ativar/desativar novas mensagens
    mensagens_internas BOOLEAN DEFAULT NULL, -- Ativar/desativar mensagens internas
    atualizacoes_sistema BOOLEAN DEFAULT NULL, -- Ativar/desativar atualizações do sistema
    ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- Tabela de Preferências do Usuário do Sistema
CREATE TABLE preferencias_usuario_sistema (
    id INT PRIMARY KEY AUTO_INCREMENT,
    colaborador_id INT NOT NULL,
    dark_ligth_mode ENUM('dark', 'light') DEFAULT NULL, -- Personalização de tema
    novas_mensagem BOOLEAN DEFAULT NULL, -- Personalização de mensagens
    mensagens_internas BOOLEAN DEFAULT NULL, -- Personalização de mensagens internas
    atualizacoes_sistema BOOLEAN DEFAULT NULL, -- Personalização de atualizações do sistema
    ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores_empresa(id) ON DELETE CASCADE
);

---------------------------------------------------------------------------------------
-- Tabela de Planos de Contratos
CREATE TABLE planos_contratos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL, -- Nome do plano
    subtitulo VARCHAR(255) DEFAULT NULL, -- Subtítulo do plano
    texto_destaque TEXT DEFAULT NULL, -- Destaque do plano
    tipo_plano ENUM('Básico', 'Premium', 'Empresarial', 'Custom') NOT NULL DEFAULT 'Básico', -- Categoria do plano
    status ENUM('Ativo', 'Expirado', 'Pendente') NOT NULL DEFAULT 'Ativo', -- Status do plano
    ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- Tabela de Detalhes dos Planos de Contratos
CREATE TABLE planos_detalhes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plano_id INT NOT NULL,
    descricao TEXT NOT NULL, -- Exemplo: "Suporte 24h", "Acesso a API", etc.
    FOREIGN KEY (plano_id) REFERENCES planos_contratos(id) ON DELETE CASCADE
);

-- Tabela de Avisos dos Planos de Contratos
CREATE TABLE planos_avisos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plano_id INT NOT NULL,
    tipo_aviso ENUM('Destaque', 'Base', 'Adicional') NOT NULL DEFAULT 'Adicional',
    descricao TEXT NOT NULL,
    FOREIGN KEY (plano_id) REFERENCES planos_contratos(id) ON DELETE CASCADE
);

 ------------------------------------------------------------------------------------------------------
 -- Tabela de Kanban
CREATE TABLE kanban_colunas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sub_departamento_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL, -- Nome da coluna (status do Kanban)
    icon VARCHAR(150) NOT NULL, -- Nome da coluna (status do Kanban)
    ordem INT NOT NULL, -- Ordem das colunas
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    FOREIGN KEY (sub_departamento_id) REFERENCES sub_departamentos(id) ON DELETE CASCADE
);

-- Tabela de Contatos do Kanban
CREATE TABLE kanban_contatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sub_departamento_id INT NOT NULL,
    coluna_id INT NOT NULL, -- Relacionamento com a coluna do Kanban
    contato_id INT NOT NULL, -- ID do contato na tabela de contatos
    favorito BOOLEAN DEFAULT FALSE, -- Para marcar como favorito
    ordem INT NOT NULL, -- Para organizar os cards
    lembrete DATETIME, -- Lembrete para o contato
    colaborador_id INT, -- ID do atendente (colaborador)
    status_etiqueta VARCHAR(155), -- Status relacionado à etiqueta
    texto_lembrete TEXT NULL, -- Status relacionado à etiqueta
    FOREIGN KEY (sub_departamento_id) REFERENCES sub_departamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (coluna_id) REFERENCES kanban_colunas(id) ON DELETE CASCADE,
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores_empresa(id) ON DELETE SET NULL
);

-- Filtro Geral (Afeta todas as colunas do Kanban)
CREATE TABLE kanban_filtros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    sub_departamento_id INT NOT NULL,
    tipo_filtro ENUM('ultimo_da_fila', 'primeiro_da_fila', 'colaborador', 'etiqueta') NOT NULL,
    valor TEXT NOT NULL,
    FOREIGN KEY (sub_departamento_id) REFERENCES sub_departamentos(id) ON DELETE CASCADE
);

-- Filtro Individual (Afeta uma coluna específica)
CREATE TABLE kanban_colunas_filtros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    coluna_id INT NOT NULL,
    tipo_filtro ENUM('neutro', 'ultimo_da_fila', 'primeiro_da_fila', 'colaborador', 'etiqueta') NOT NULL,
    valor TEXT NOT NULL,
    FOREIGN KEY (coluna_id) REFERENCES kanban_colunas(id) ON DELETE CASCADE
);





-- Índice para buscas rápidas por telefone do cliente
CREATE INDEX idx_cliente_telefone ON clientes(telefone);

-- Índice para otimizar ordenação e filtragem por data de envio das mensagens
CREATE INDEX idx_mensagens_data ON mensagens(data_envio);

-- Índice para otimizar busca de mensagens por status
CREATE INDEX idx_mensagens_status ON mensagens(status);

-- Índice composto para otimizar buscas por cliente e status da mensagem
CREATE INDEX idx_status_mensagem ON status_mensagem(cliente_id, status);
