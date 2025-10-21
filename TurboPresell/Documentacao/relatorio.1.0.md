# Relatório Técnico do Projeto: Sistema de Clonagem de Landing Pages para Afiliados

## Visão Geral

O projeto consiste em um sistema full-stack para criação e gerenciamento de campanhas de marketing de afiliados, permitindo a clonagem de páginas de vendas externas e a adição de modais de consentimento de cookies. O sistema é robusto, com fallback automático para captura de screenshots caso a clonagem direta seja bloqueada, garantindo alta taxa de sucesso na entrega das páginas.

---

## Arquitetura do Sistema

### Frontend

- **Framework:** React 18 + TypeScript
- **Gerenciamento de Estado:** TanStack Query
- **UI:** shadcn/ui (Radix UI) + Tailwind CSS
  - Componentes avançados: Accordion, Dialog, Tabs, etc.
  - Sistema de temas claro/escuro
  - Efeitos visuais configuráveis
- **Roteamento:** Wouter
- **Validação de Formulários:** React Hook Form + Zod
- **Responsividade:** Mobile-first, com componentes reutilizáveis
- **Feedback:** Sistema de notificações sonoras personalizável

### Backend

- **Framework:** Express.js + TypeScript
- **Banco de Dados:** PostgreSQL com Drizzle ORM
- **Serviços Principais:** 
  - Clonagem de páginas (Cheerio)
  - Captura de screenshots responsivos (Puppeteer)
    - Suporte a múltiplas resoluções (270px até 2124px)
  - Gerenciamento de campanhas e usuários
  - Integração com API de IA para chat
- **Armazenamento:** Estratégia híbrida (banco de dados + filesystem)
- **Sessões:** connect-pg-simple

### Estrutura de Dados

- **Tabelas Principais:**
  - `users`: Gerenciamento de usuários
  - `campaigns`: Campanhas de presell
  - `settings`: Configurações avançadas do usuário
  - `chatConversations` e `chatMessages`: Sistema de chat
  - `campaignViews` e `campaignClicks`: Analytics detalhado
- **Armazenamento de Arquivos:**
  - Diretórios por campanha para screenshots
  - Sistema de sons para notificações
- **Migrations:** Automatizadas via Drizzle

---

## Fluxos Principais

### Criação de Campanha

1. Usuário preenche formulário com URL de origem e de afiliado
2. Validação dos dados (Zod)
3. Campanha criada com status "pending"
4. Backend processa:
   - Tenta clonar HTML (Cheerio)
   - Se falhar, captura screenshots (Puppeteer)
   - Atualiza status e conteúdo da campanha

### Renderização da Página Presell

1. Usuário acessa URL curta gerada
2. Sistema busca dados da campanha
3. Serve HTML clonado ou página baseada em screenshots
4. Injeta modal de cookies (se habilitado)
5. Redireciona para URL de afiliado após interação

### Sistema de Chat AI

1. Interface de chat integrada
2. Personalidades de IA configuráveis
3. Histórico de conversas persistente
4. Sugestão automática de perguntas
5. Configuração flexível de API keys

---

## Pontos Fortes

- **Resiliência:** Fallback automático para screenshots
- **Escalabilidade:** Arquitetura modular e uso de ORM
- **Manutenibilidade:** Código organizado e padrões modernos
- **Experiência do Usuário:**
  - UI responsiva com temas
  - Feedback sonoro configurável
  - Proteção contra deleção em massa
  - Formulários validados
- **Analytics:** Rastreamento detalhado de views e clicks
- **Internacionalização:** Suporte multilíngue nos modais
- **IA Integrada:** Sistema de chat com personalidades configuráveis

---

## Pontos de Atenção e Sugestões

- **Escalabilidade:**
  - Implementar filas para processamento assíncrono
  - Otimizar captura de screenshots
- **Armazenamento:**
  - Migrar para storage externo (ex: S3)
  - Implementar CDN para assets
- **Monitoramento:**
  - Logs estruturados
  - Telemetria de uso da IA
  - Métricas de performance
- **Segurança:**
  - Auditoria de acessos
  - Rate limiting para APIs
  - Proteção contra ataques
- **Testes:** Ampliar cobertura (unitários e E2E)
- **DevOps:** Separação de ambientes e CI/CD

---

## Próximos Passos Recomendados

1. Sistema de filas para processamento em larga escala
2. Storage externo para assets
3. Painel de administração e monitoramento
4. Pipeline de CI/CD
5. Expansão de testes automatizados
6. Otimização de performance do chat AI
7. Sistema de cache para conteúdo clonado

---

## Conclusão

O projeto apresenta uma arquitetura moderna, escalável e resiliente, com foco em experiência do usuário e recursos avançados como IA e analytics. A base técnica sólida permite fácil expansão e manutenção, enquanto os recursos de personalização e feedback proporcionam uma experiência rica aos usuários.

Se desejar um relatório mais detalhado sobre algum módulo específico ou recomendações de arquitetura, basta solicitar!
