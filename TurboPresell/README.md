# TurboPresell

## 📋 Visão Geral

TurboPresell é uma aplicação para criação e gerenciamento de páginas de pré-venda (presell pages) para marketing de afiliados.

## 🔄 Migração para Supabase e Deploy na Vercel

Este projeto foi configurado para usar o Supabase como banco de dados e ser implantado na Vercel. A configuração inclui:

1. Integração com Supabase para armazenamento de dados
2. Configuração para deploy na Vercel
3. Variáveis de ambiente para produção e desenvolvimento
4. Estrutura de arquivos otimizada para serverless

----
## 🚀 Começando

### Pré-requisitos

- Node.js (versão recomendada: 18+)
- Docker e Docker Compose
- npm ou yarn

### Instalação para Desenvolvimento Local

1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd TurboPresell
```

2. Instale as dependências

```bash
npm install
```

3. Configure o arquivo .env.local na raiz do projeto

```
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_DB_URL=postgres://postgres:postgres@db.your-project-id.supabase.co:5432/postgres

# OpenAI API Key (se necessário)
VITE_OPENAI_API_KEY=your_openai_api_key

# Configurações do Ambiente
NODE_ENV=development
```

4. Inicialize o banco de dados (cria as tabelas)

```bash
npm run db:push
```

5. Inicie a aplicação em modo de desenvolvimento

```bash
npm run dev
```

### Deploy na Vercel

1. Instale a CLI da Vercel (se ainda não tiver)

```bash
npm install -g vercel
```

2. Faça login na Vercel

```bash
vercel login
```

3. Configure as variáveis de ambiente na Vercel

Acesse o dashboard da Vercel, vá para o seu projeto e adicione as seguintes variáveis de ambiente:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_DB_URL=postgres://postgres:postgres@db.your-project-id.supabase.co:5432/postgres
VITE_OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
```

4. Faça o deploy

```bash
vercel deploy
```

Ou configure o GitHub para deploy automático através do dashboard da Vercel.

## 📚 Documentação

Para mais detalhes sobre a configuração do PostgreSQL, consulte o arquivo [setup-postgres-local.md](./PostgreSQL/setup-postgres-local.md) na pasta PostgreSQL.

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento usando .env.local
- `npm run build` - Compila o projeto para produção
- `npm run start` - Inicia o servidor em modo de produção
- `npm run check` - Verifica os tipos TypeScript
- `npm run db:push` - Atualiza o esquema do banco de dados usando Drizzle Kit
- `npm run db:studio` - Inicia o Drizzle Studio para visualizar o banco de dados
- `npm run db:generate` - Gera tipos TypeScript para o esquema do banco de dados
- `npm run db:init` - Inicializa o banco de dados e cria as tabelas
- `npm run db:migrate-data` - Migra dados para o banco de dados
- `npm run db:check` - Verifica a conexão com o banco de dados
- `npm run vercel-build` - Script de build para a Vercel
- `npm run vercel-dev` - Inicia o ambiente de desenvolvimento da Vercel localmente

## 🗄️ Estrutura do Banco de Dados

O esquema do banco de dados está definido em `shared/schema.ts` e inclui as seguintes tabelas:

- `users` - Usuários do sistema
- `campaigns` - Campanhas de marketing
- `settings` - Configurações do usuário
- `chatConversations` - Conversas de chat
- `chatMessages` - Mensagens de chat
- `campaignViews` - Visualizações de campanhas
- `campaignClicks` - Cliques em campanhas

## 📁 Estrutura do Projeto para Vercel

- `/api/...` - Rotas backend (servidas pela Vercel como funções serverless)
- `/lib/supabaseClient.ts` - Cliente de conexão com Supabase
- `/lib/database.types.ts` - Tipos TypeScript para o banco de dados Supabase
- `.env.local` - Variáveis de ambiente para desenvolvimento local (não incluído no Git)
- `.env.example` - Exemplo de variáveis de ambiente necessárias
- `vercel.json` - Configuração para deploy na Vercel