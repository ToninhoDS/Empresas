# Documentação do Projeto - WhatsApp Tech Dashboard

## Índice
1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Componentes Principais](#componentes-principais)
5. [Estilo de Design](#estilo-de-design)
6. [Fluxo de Autenticação](#fluxo-de-autenticação)
7. [Gestão de Estado](#gestão-de-estado)
8. [Integração com Supabase](#integração-com-supabase)
9. [Funcionalidades Principais](#funcionalidades-principais)
10. [Guia de Contribuição](#guia-de-contribuição)

## Visão Geral

O WhatsApp Tech Dashboard é uma aplicação web desenvolvida para gerenciar interações com clientes por meio do WhatsApp. A plataforma oferece funcionalidades de dashboard administrativo, gestão de mensagens, gerenciamento de usuários e departamentos, com diferentes níveis de acesso baseados em papéis de usuário (admin, supervisor, agente).

A aplicação é projetada com uma arquitetura moderna e escalável, utilizando React com TypeScript e um design responsivo baseado em componentes reutilizáveis.

## Tecnologias Utilizadas

- **Framework**: React com TypeScript
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS
- **Componentes UI**: shadcn/ui (baseado em Radix UI)
- **Roteamento**: React Router DOM
- **Gestão de Estado**: React Context API, React Query
- **Formulários**: React Hook Form, Zod (validação)
- **Gráficos**: Recharts
- **Backend/BaaS**: Supabase
- **Drag and Drop**: @hello-pangea/dnd
- **Notificações**: Sonner, Radix UI Toast
- **Ícones**: Lucide React

## Estrutura do Projeto

```
├── public/              # Arquivos estáticos
├── src/                 # Código fonte
│   ├── components/      # Componentes React reutilizáveis
│   │   ├── chat/        # Componentes relacionados ao chat
│   │   ├── contacts/    # Componentes de gestão de contatos
│   │   ├── dashboard/   # Componentes do painel principal
│   │   ├── dnd/         # Componentes de drag-and-drop
│   │   ├── icons/       # Ícones customizados
│   │   ├── kanban/      # Componentes para visualização Kanban
│   │   ├── layout/      # Componentes estruturais (Sidebar, Layout)
│   │   ├── messages/    # Componentes de gestão de mensagens
│   │   ├── modals/      # Modais reutilizáveis
│   │   ├── settings/    # Componentes de configurações
│   │   ├── ui/          # Componentes base da UI (shadcn)
│   │   └── users/       # Componentes de gestão de usuários
│   ├── contexts/        # Contextos React para gerenciamento de estado
│   ├── database/        # Configurações e utilitários de banco de dados
│   ├── entities/        # Definições de entidades/modelos
│   ├── hooks/           # Hooks personalizados
│   ├── lib/             # Utilitários e funções auxiliares
│   ├── models/          # Modelos de dados
│   ├── pages/           # Páginas/rotas da aplicação
│   ├── repositories/    # Camada de acesso a dados
│   ├── routes/          # Configuração de rotas
│   ├── services/        # Serviços para lógica de negócios
│   ├── types/           # Definições de tipos TypeScript
│   ├── utils/           # Funções utilitárias
│   ├── App.tsx          # Componente principal da aplicação
│   ├── App.css          # Estilos globais da aplicação
│   ├── index.css        # Estilos globais e configuração do Tailwind
│   └── main.tsx         # Ponto de entrada da aplicação
├── supabase/            # Configurações do Supabase
├── tailwind.config.ts   # Configuração do Tailwind CSS
├── tsconfig.json        # Configuração do TypeScript
└── vite.config.ts       # Configuração do Vite
```

## Componentes Principais

### Layout

- **DashboardLayout**: Estrutura principal que encapsula todas as páginas autenticadas, incorporando a Sidebar e o conteúdo principal.
- **Sidebar**: Navegação lateral com itens dinâmicos baseados no papel do usuário logado, com opção de colapsar para melhor uso do espaço.

### Autenticação

- **ProtectedRoute**: HOC (Higher-Order Component) que protege rotas contra acesso não autenticado.
- **Login**: Página de autenticação com formulário de login.
- **ChangePasswordModal**: Modal para alteração de senha e handling de primeiro acesso.

### Dashboard

- **DashboardStats**: Exibe estatísticas gerais e KPIs do sistema.
- **MessageStats**: Métricas específicas relacionadas às mensagens.
- **Charts**: Componentes de visualização de dados usando Recharts.

### Mensagens

- **Messages**: Interface principal para gerenciamento de conversas.
- **PredefinedMessages**: Gerenciamento de templates de mensagens prontas.
- **MessageStats**: Componente de análise e visualização de métricas de mensagens.

### Usuários e Departamentos

- **Users**: Gerenciamento de usuários do sistema.
- **Departments**: Gerenciamento de departamentos organizacionais.
- **TeamSupervision**: Funcionalidades de supervisão para gerentes e administradores.

### Kanban (Pipeline)

- **Pipeline**: Visualização e gerenciamento de fluxo de trabalho em formato kanban.
- **KanbanBoard**: Layout de arrastamento para organização visual de tarefas.

## Estilo de Design

O projeto segue uma estética moderna e limpa, com um design system baseado nos seguintes princípios:

### Cores

- **Cores primárias**: Verde WhatsApp (#25D366, #075E54)
- **Cor secundária**: Azul WhatsApp (#34B7F1)
- **Cor terciária**: Verde teal (#128C7E)
- **Neutros**: Brancos, cinzas (#f8f9fa, #e9ecef, #dee2e6, etc)

### Tipografia

- **Família de fonte principal**: Sistema sans-serif
- **Tamanhos**: 
  - Títulos: 1.5rem - 2.5rem
  - Corpo de texto: 0.875rem - 1rem
  - Meta-dados: 0.75rem

### Componentes UI

A aplicação utiliza componentes do shadcn/ui, que é uma coleção de componentes reutilizáveis baseados no Radix UI, com estilização customizada através do Tailwind CSS. Isso proporciona:

- Acessibilidade nativa
- Estilização flexível e consistente
- Componentização lógica e reutilizável
- Interações fluidas e responsivas

### Layout Responsivo

A aplicação é totalmente responsiva, adaptando-se a diferentes tamanhos de tela:

- **Desktop**: Layout completo com sidebar expandida
- **Tablet**: Sidebar colapsável para otimizar espaço
- **Mobile**: Navegação adaptada para telas pequenas

## Fluxo de Autenticação

1. **Login**: Usuário acessa com credenciais (email/senha)
2. **Validação**: Credenciais verificadas contra o Supabase
3. **Armazenamento**: Informações do usuário armazenadas no localStorage
4. **Verificação de Primeiro Acesso**: Exibição de modal para troca de senha se necessário
5. **Rotas Protegidas**: Todas as rotas, exceto login, são protegidas pelo componente ProtectedRoute
6. **Controle de Acesso**: Itens de menu e funcionalidades apresentadas conforme o papel do usuário (admin, supervisor, agente)

## Gestão de Estado

- **localStorage**: Armazenamento de informações de autenticação do usuário
- **Context API**: Utilizada para compartilhar estados entre componentes relacionados
- **React Query**: Gerenciamento de estado do servidor, caching e sincronização
- **Hooks personalizados**: Abstraindo lógica de estado comum (useAuth, etc)

## Integração com Supabase

O projeto utiliza o Supabase como backend-as-a-service, aproveitando:

- **Autenticação**: Sistema de login e gestão de usuários
- **Banco de Dados**: PostgreSQL para armazenamento de dados
- **Storage**: Armazenamento de arquivos e mídia
- **Realtime**: Atualizações em tempo real para mensagens e notificações

## Funcionalidades Principais

1. **Dashboard**: Visualização de KPIs e métricas de desempenho
2. **Pipeline (Kanban)**: Gestão visual de fluxo de trabalho
3. **Mensagens**: Interface de chat para comunicação com clientes
4. **Contatos**: Gerenciamento de contatos e clientes
5. **Mensagens Prontas**: Templates pré-definidos para agilizar comunicação
6. **Usuários**: Administração de usuários do sistema
7. **Departamentos**: Organização estrutural dos setores da empresa
8. **Consulta Avançada**: Ferramenta de pesquisa com filtros avançados
9. **Supervisão**: Monitoramento e controle de equipes
10. **Chat Interno**: Comunicação entre membros da equipe
11. **Configurações**: Personalização do sistema

## Guia de Contribuição

### Requisitos para Desenvolvimento

- Node.js (v18+)
- npm/yarn/bun

### Instalação para Desenvolvimento

1. Clone o repositório
2. Instale as dependências: `npm install` ou `bun install`
3. Crie um arquivo `.env` baseado no exemplo (para conexão com Supabase)
4. Execute o projeto: `npm run dev` ou `bun dev`

### Convenções de Código

- **TypeScript**: Utilize tipos apropriados para todas as funções e componentes
- **Componentes**: Componentes funcionais com React Hooks
- **Estilização**: Utilize classes do Tailwind CSS, evitando CSS inline
- **Estado**: Prefira hooks do React (useState, useReducer) e Context API
- **Formulários**: Utilize React Hook Form com validação Zod
- **Importações**: Use aliases (@/) para importações mais limpas

### Fluxo de Trabalho

1. Crie branches para novas funcionalidades: `feature/nome-da-feature`
2. Mantenha commits pequenos e bem descritos
3. Solicite revisão de código antes de mesclar com a main
4. Teste todas as alterações antes de submeter

---

Documentação criada em: 05 de maio de 2024
Versão: 1.0 