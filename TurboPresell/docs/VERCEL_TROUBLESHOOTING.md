# Solução de Problemas no Vercel

## Erro: Failed to load module script

Se você encontrar o erro abaixo após implantar o projeto no Vercel:

```
main.tsx:1 Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html". Strict MIME type checking is enforced for module scripts per HTML spec.
```

Este erro ocorre porque o Vercel está servindo arquivos HTML quando o navegador espera arquivos JavaScript. Isso acontece devido à configuração de rotas no `vercel.json` que está direcionando todas as requisições para o arquivo HTML.

### Solução Implementada

1. **Atualização do `vercel.json`**:
   - Configuramos rotas específicas para servir corretamente os arquivos estáticos (JS, CSS, imagens)
   - Atualizamos a configuração de build para usar o diretório `dist/public` para arquivos estáticos

2. **Atualização do `vite.config.ts`**:
   - Adicionamos a opção `base: "/"` para garantir que os caminhos dos assets sejam relativos à raiz

### Configuração Atual

#### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node",
      "config": { "includeFiles": ["dist/**"] }
    },
    {
      "src": "dist/public/**",
      "use": "@vercel/static"
    }
  ],
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
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### vite.config.ts

```typescript
export default defineConfig({
  base: "/",
  // ... outras configurações
});
```

### Explicação

1. **Rotas no vercel.json**:
   - `/api/(.*)`: Direciona todas as chamadas de API para o servidor Node.js
   - `/assets/(.*)`: Direciona requisições de assets para o diretório correto
   - `/(.*\.(js|css|ico|png|jpg|jpeg|svg|json))`: Serve arquivos estáticos diretamente
   - `/(.*)`: Serve o index.html para todas as outras rotas (para suportar roteamento do lado do cliente)

2. **Base URL no vite.config.ts**:
   - A configuração `base: "/"` garante que todos os caminhos de assets no HTML gerado sejam relativos à raiz do site

### Verificação

Após implantar essas alterações, verifique se:

1. A página inicial carrega corretamente
2. Os arquivos JavaScript são carregados sem erros de MIME type
3. A navegação entre rotas funciona corretamente
4. As chamadas de API funcionam como esperado

Se o problema persistir, verifique os logs de implantação no Vercel para identificar possíveis erros adicionais.