# 🐘 Setup PostgreSQL Local com Docker

Este guia configura um banco de dados **PostgreSQL local** usando **Docker**, ideal para desenvolvimento do projeto TurboPresell.

---

## 📦 docker-compose.yml
docker-compose.yml atualizado com PostgreSQL + pgAdmin + acesso de rede
Crie um arquivo `docker-compose.yml` na raiz do projeto:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: postgres_lovabre
    restart: always
    environment:
      POSTGRES_USER: turbopresell
      POSTGRES_PASSWORD: turbopresell
      POSTGRES_DB: turbopresell
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - postgres_net

  pgadmin:
    image: dpage/pgadmin4
    container_name: pgadmin_lovabre
    restart: always
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    depends_on:
      - postgres
    networks:
      - postgres_net

volumes:
  pgdata:

networks:
  postgres_net:
    driver: bridge

``` 
---
## EXEMPLO do .env da pasta raiz

DB_HOST=localhost
DB_PORT=5432
DB_USER=turbopresell
DB_PASSWORD=turbopresell
DB_NAME=turbopresell

## 🛠️ Como iniciar o PostgreSQL

### Usando scripts npm
```bash
# Iniciar o PostgreSQL e pgAdmin
npm run postgres:start

# Parar o PostgreSQL e pgAdmin
npm run postgres:stop
```

### Usando Docker diretamente
```bash
# Na pasta PostgreSQL
docker-compose up -d

# Para parar
docker-compose down
```

## 🔄 Migração de dados
Para migrar os dados dos arquivos JSON para o PostgreSQL:

1. Certifique-se de que o PostgreSQL está rodando
2. Execute o comando:
```bash
npm run db:migrate-data
```

## 🚀 Inicialização do banco de dados
Para criar as tabelas no PostgreSQL:

```bash
# Usando o script de inicialização
npm run db:init

# OU usando o Drizzle Kit
npm run db:push
```

## ✅ Testar conexão (via terminal ou DBeaver, Insomnia, etc.)
- Host: localhost OU seu IP local
- Porta: 5432
- Usuário: turbopresell
- Senha: turbopresell
- Banco: turbopresell

## 🔍 Acessar o pgAdmin 
✅ O pgAdmin está disponível em http://localhost:5050

Credenciais de acesso:
- Email: admin@admin.com
- Senha: admin123

### Configurar conexão no pgAdmin:
1. Clique em "Add New Server"
2. Na aba "General", dê um nome como "TurboPresell"
3. Na aba "Connection", preencha:
   - Host: postgres (nome do serviço no docker-compose)
   - Port: 5432
   - Username: turbopresell
   - Password: turbopresell
   - Database: turbopresell
4. Clique em "Save"