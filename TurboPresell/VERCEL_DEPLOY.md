# Deploy na Vercel com Supabase

Este guia fornece instruções detalhadas para fazer o deploy do TurboPresell na Vercel usando o Supabase como banco de dados.

## Pré-requisitos

1. Uma conta na [Vercel](https://vercel.com)
2. Uma conta no [Supabase](https://supabase.com)
3. Um projeto criado no Supabase
4. Node.js instalado localmente

## Configuração do Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.com) e crie um novo projeto ou use um existente

2. No projeto Supabase, vá para **SQL Editor** e execute o seguinte SQL para criar as tabelas necessárias:

```sql
-- Este SQL será gerado automaticamente pelo Drizzle ORM
-- Use o comando: npm run db:push
```

3. Obtenha as credenciais do Supabase:
   - No dashboard do projeto, vá para **Settings > API**
   - Copie a **URL** e a **anon key**
   - Para a URL de conexão do banco de dados, vá para **Settings > Database > Connection Pooling** e copie a string de conexão

## Configuração Local

1. Clone o repositório e instale as dependências:

```bash
git clone <url-do-repositorio>
cd TurboPresell
npm install
```

2. Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_DB_URL=postgres://postgres:postgres@db.seu-projeto.supabase.co:5432/postgres
VITE_OPENAI_API_KEY=sua-chave-openai (se necessário)
NODE_ENV=development
```

3. Execute o comando para criar as tabelas no Supabase:

```bash
npm run db:push
```

4. Teste a aplicação localmente:

```bash
npm run dev
```

## Deploy na Vercel

### Opção 1: Deploy via CLI

1. Instale a CLI da Vercel:

```bash
npm install -g vercel
```

2. Faça login na Vercel:

```bash
vercel login
```

3. Configure as variáveis de ambiente:

```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_DB_URL
vercel env add VITE_OPENAI_API_KEY (se necessário)
vercel env add NODE_ENV production
```

4. Faça o deploy:

```bash
vercel deploy
```

### Opção 2: Deploy via Dashboard

1. Faça o push do seu código para um repositório Git (GitHub, GitLab, Bitbucket)

2. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)

3. Clique em **Add New > Project**

4. Importe o repositório Git

5. Configure as variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_DB_URL`
   - `VITE_OPENAI_API_KEY` (se necessário)
   - `NODE_ENV` = `production`

6. Clique em **Deploy**

## Verificação do Deploy

1. Após o deploy, acesse a URL fornecida pela Vercel

2. Verifique se todas as funcionalidades estão operando corretamente

3. Verifique os logs na Vercel para identificar possíveis erros

## Solução de Problemas

### Erro de conexão com o Supabase

- Verifique se as variáveis de ambiente estão configuradas corretamente
- Verifique se o IP da Vercel está na lista de IPs permitidos no Supabase (se aplicável)

### Erro no build

- Verifique os logs de build na Vercel
- Certifique-se de que todas as dependências estão instaladas

### Problemas com rotas de API

- Verifique se o arquivo `vercel.json` está configurado corretamente
- Verifique se as rotas de API estão no formato correto para funções serverless

### Erro: Failed to load module script

Se você encontrar o erro abaixo após implantar o projeto no Vercel:

```
main.tsx:1 Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html". Strict MIME type checking is enforced for module scripts per HTML spec.
```

Este erro ocorre porque o Vercel está servindo arquivos HTML quando o navegador espera arquivos JavaScript. Para resolver:

1. **Verifique o arquivo `vercel.json`** - Certifique-se de que as rotas estão configuradas corretamente para servir arquivos estáticos:

```json
"routes": [
  {
    "src": "/api/(.*)",
    "dest": "dist/index.js"
  },
  {
    "src": "/assets/(.*)",
    "dest": "/dist/public/assets/$1"
  },
  {
    "src": "/(.*\\.(js|css|ico|png|jpg|jpeg|svg|json))",
    "dest": "/dist/public/$1"
  },
  {
    "src": "/(.*)",
    "dest": "/dist/public/index.html"
  }
]
```

2. **Verifique o arquivo `vite.config.ts`** - Adicione a opção `base: "/"` para garantir que os caminhos dos assets sejam relativos à raiz:

```typescript
export default defineConfig({
  base: "/",
  // ... outras configurações
});
```

Para mais detalhes, consulte o arquivo `docs/VERCEL_TROUBLESHOOTING.md`.

## Recursos Adicionais

- [Documentação da Vercel](https://vercel.com/docs)
- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Serverless Functions na Vercel](https://vercel.com/docs/functions/serverless-functions)