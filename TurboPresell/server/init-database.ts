import { db, supabase } from './db';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';

async function initDatabase() {
  console.log('Inicializando banco de dados PostgreSQL...');
  
  try {
    // Verificar conexão com o banco de dados
    console.log('Verificando conexão com o banco de dados...');
    await db.execute(sql`SELECT 1`);
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    
    // Criar tabelas usando o Drizzle ORM
    console.log('Criando tabelas no banco de dados...');
    
    // Tabela de usuários
    console.log('Criando tabela de usuários...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `);
    
    // Tabela de campanhas
    console.log('Criando tabela de campanhas...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        source_url VARCHAR(2048) NOT NULL,
        affiliate_url VARCHAR(2048) NOT NULL,
        short_url VARCHAR(32) NOT NULL UNIQUE,
        cloning_mode VARCHAR(32) NOT NULL DEFAULT 'automatic',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        enable_cookie_modal BOOLEAN NOT NULL DEFAULT TRUE,
        cookie_modal_language VARCHAR(32) NOT NULL DEFAULT 'english',
        cookie_modal_title VARCHAR(255) NOT NULL DEFAULT 'Cookie Policy',
        cookie_modal_text TEXT,
        cookie_policy_link VARCHAR(2048),
        accept_button_text VARCHAR(64) NOT NULL DEFAULT 'Accept',
        close_button_text VARCHAR(64) NOT NULL DEFAULT 'Close',
        cloning_status VARCHAR(32) NOT NULL DEFAULT 'pending',
        cloned_html TEXT,
        screenshot_paths TEXT,
        views INTEGER NOT NULL DEFAULT 0,
        clicks INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Tabela de configurações
    console.log('Criando tabela de configurações...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
        card_effects BOOLEAN NOT NULL DEFAULT TRUE,
        bulk_delete_protection BOOLEAN NOT NULL DEFAULT FALSE,
        sound_notifications BOOLEAN NOT NULL DEFAULT FALSE,
        click_sound_file VARCHAR(255) NOT NULL DEFAULT '1 - cute_notification_1750530967074.mp3',
        ai_api_key TEXT NOT NULL DEFAULT '',
        ai_personalities TEXT[] NOT NULL DEFAULT '{}',
        ai_behavior_prompt TEXT NOT NULL DEFAULT '',
        ai_suggest_questions BOOLEAN NOT NULL DEFAULT TRUE,
        use_default_personality BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Tabela de conversas de chat
    console.log('Criando tabela de conversas de chat...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title VARCHAR(255) NOT NULL DEFAULT 'Nova Conversa',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Tabela de mensagens de chat
    console.log('Criando tabela de mensagens de chat...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(255) PRIMARY KEY,
        conversation_id VARCHAR(255) NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Tabela de visualizações de campanha
    console.log('Criando tabela de visualizações de campanha...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS campaign_views (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        user_agent VARCHAR(500),
        ip_address VARCHAR(45),
        referer VARCHAR(500)
      )
    `);
    
    // Tabela de cliques de campanha
    console.log('Criando tabela de cliques de campanha...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS campaign_clicks (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        user_agent VARCHAR(500),
        ip_address VARCHAR(45),
        referer VARCHAR(500)
      )
    `);
    
    console.log('Todas as tabelas foram criadas com sucesso!');
    console.log('Inicialização do banco de dados concluída!');
  } catch (error) {
    console.error('Erro durante a inicialização do banco de dados:', error);
  }
}

// Executar a inicialização
initDatabase().catch(console.error);