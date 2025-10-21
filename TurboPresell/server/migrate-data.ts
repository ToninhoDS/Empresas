import { db, supabase } from './db';
import { sql } from 'drizzle-orm';
import * as schema from '@shared/schema';
import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

// Função para ler um arquivo JSON
async function readJsonFile(filePath: string) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao ler o arquivo ${filePath}:`, error);
    return [];
  }
}

// Função principal para migrar dados
async function migrateData() {
  console.log('Iniciando migração de dados para PostgreSQL...');
  
  try {
    // Caminho base para os arquivos JSON
    const basePath = path.join(process.cwd(), 'Database', 'db json');
    
    // Migrar usuários
    console.log('Migrando usuários...');
    const users = await readJsonFile(path.join(basePath, 'users.json'));
    if (users.length > 0) {
      for (const user of users) {
        // Verificar se o usuário já existe
        const existingUser = await db.select()
          .from(schema.users)
          .where(sql`${schema.users.username} = ${user.username}`)
          .limit(1);
        
        if (existingUser.length === 0) {
          await db.insert(schema.users).values({
            id: user.id,
            username: user.username,
            password: user.password
          });
          console.log(`Usuário ${user.username} migrado com sucesso.`);
        } else {
          console.log(`Usuário ${user.username} já existe, pulando.`);
        }
      }
    }
    
    // Migrar campanhas
    console.log('Migrando campanhas...');
    const campaigns = await readJsonFile(path.join(basePath, 'campaigns.json'));
    if (campaigns.length > 0) {
      for (const campaign of campaigns) {
        // Verificar se a campanha já existe
        const existingCampaign = await db.select()
          .from(schema.campaigns)
          .where(sql`${schema.campaigns.shortUrl} = ${campaign.short_url}`)
          .limit(1);
        
        if (existingCampaign.length === 0) {
          await db.insert(schema.campaigns).values({
            id: campaign.id,
            name: campaign.name,
            description: campaign.description,
            sourceUrl: campaign.source_url,
            affiliateUrl: campaign.affiliate_url,
            shortUrl: campaign.short_url,
            cloningMode: campaign.cloning_mode,
            isActive: campaign.is_active,
            enableCookieModal: campaign.enable_cookie_modal,
            cookieModalLanguage: campaign.cookie_modal_language,
            cookieModalTitle: campaign.cookie_modal_title,
            cookieModalText: campaign.cookie_modal_text,
            cookiePolicyLink: campaign.cookie_policy_link,
            acceptButtonText: campaign.accept_button_text,
            closeButtonText: campaign.close_button_text,
            cloningStatus: campaign.cloning_status,
            clonedHtml: campaign.cloned_html,
            screenshotPaths: campaign.screenshot_paths,
            views: campaign.views,
            clicks: campaign.clicks,
            createdAt: new Date(campaign.created_at),
            updatedAt: new Date(campaign.updated_at)
          });
          console.log(`Campanha ${campaign.name} migrada com sucesso.`);
        } else {
          console.log(`Campanha ${campaign.name} já existe, pulando.`);
        }
      }
    }
    
    // Migrar configurações
    console.log('Migrando configurações...');
    const settingsData = await readJsonFile(path.join(basePath, 'settings.json'));
    if (settingsData.length > 0) {
      for (const setting of settingsData) {
        // Verificar se as configurações já existem para o usuário
        const existingSettings = await db.select()
          .from(schema.settings)
          .where(sql`${schema.settings.userId} = ${setting.user_id}`)
          .limit(1);
        
        if (existingSettings.length === 0) {
          await db.insert(schema.settings).values({
            id: setting.id,
            userId: setting.user_id,
            darkMode: setting.dark_mode,
            cardEffects: setting.card_effects,
            bulkDeleteProtection: setting.bulk_delete_protection,
            soundNotifications: setting.sound_notifications,
            clickSoundFile: setting.click_sound_file,
            aiApiKey: setting.ai_api_key,
            aiPersonalities: setting.ai_personalities,
            aiBehaviorPrompt: setting.ai_behavior_prompt,
            aiSuggestQuestions: setting.ai_suggest_questions,
            useDefaultPersonality: setting.use_default_personality,
            createdAt: new Date(setting.created_at),
            updatedAt: new Date(setting.updated_at)
          });
          console.log(`Configurações para o usuário ${setting.user_id} migradas com sucesso.`);
        } else {
          console.log(`Configurações para o usuário ${setting.user_id} já existem, pulando.`);
        }
      }
    }
    
    // Migrar conversas de chat
    console.log('Migrando conversas de chat...');
    const chatConversations = await readJsonFile(path.join(basePath, 'chat_conversations.json'));
    if (chatConversations.length > 0) {
      for (const conversation of chatConversations) {
        // Verificar se a conversa já existe
        const existingConversation = await db.select()
          .from(schema.chatConversations)
          .where(sql`${schema.chatConversations.id} = ${conversation.id}`)
          .limit(1);
        
        if (existingConversation.length === 0) {
          await db.insert(schema.chatConversations).values({
            id: conversation.id,
            userId: conversation.user_id,
            title: conversation.title,
            createdAt: new Date(conversation.created_at),
            updatedAt: new Date(conversation.updated_at)
          });
          console.log(`Conversa ${conversation.title} migrada com sucesso.`);
        } else {
          console.log(`Conversa ${conversation.title} já existe, pulando.`);
        }
      }
    }
    
    // Migrar mensagens de chat
    console.log('Migrando mensagens de chat...');
    const chatMessages = await readJsonFile(path.join(basePath, 'chat_messages.json'));
    if (chatMessages.length > 0) {
      for (const message of chatMessages) {
        // Verificar se a mensagem já existe
        const existingMessage = await db.select()
          .from(schema.chatMessages)
          .where(sql`${schema.chatMessages.id} = ${message.id}`)
          .limit(1);
        
        if (existingMessage.length === 0) {
          await db.insert(schema.chatMessages).values({
            id: message.id,
            conversationId: message.conversation_id,
            role: message.role,
            content: message.content,
            timestamp: new Date(message.timestamp)
          });
          console.log(`Mensagem ${message.id} migrada com sucesso.`);
        } else {
          console.log(`Mensagem ${message.id} já existe, pulando.`);
        }
      }
    }
    
    // Migrar visualizações de campanha
    console.log('Migrando visualizações de campanha...');
    const campaignViews = await readJsonFile(path.join(basePath, 'campaign_views.json'));
    if (campaignViews.length > 0) {
      for (const view of campaignViews) {
        // Verificar se a visualização já existe
        const existingView = await db.select()
          .from(schema.campaignViews)
          .where(sql`${schema.campaignViews.id} = ${view.id}`)
          .limit(1);
        
        if (existingView.length === 0) {
          await db.insert(schema.campaignViews).values({
            id: view.id,
            campaignId: view.campaign_id,
            timestamp: new Date(view.timestamp),
            userAgent: view.user_agent,
            ipAddress: view.ip_address,
            referer: view.referer
          });
          console.log(`Visualização ${view.id} migrada com sucesso.`);
        } else {
          console.log(`Visualização ${view.id} já existe, pulando.`);
        }
      }
    }
    
    // Migrar cliques de campanha
    console.log('Migrando cliques de campanha...');
    const campaignClicks = await readJsonFile(path.join(basePath, 'campaign_clicks.json'));
    if (campaignClicks.length > 0) {
      for (const click of campaignClicks) {
        // Verificar se o clique já existe
        const existingClick = await db.select()
          .from(schema.campaignClicks)
          .where(sql`${schema.campaignClicks.id} = ${click.id}`)
          .limit(1);
        
        if (existingClick.length === 0) {
          await db.insert(schema.campaignClicks).values({
            id: click.id,
            campaignId: click.campaign_id,
            timestamp: new Date(click.timestamp),
            userAgent: click.user_agent,
            ipAddress: click.ip_address,
            referer: click.referer
          });
          console.log(`Clique ${click.id} migrado com sucesso.`);
        } else {
          console.log(`Clique ${click.id} já existe, pulando.`);
        }
      }
    }
    
    console.log('Migração de dados concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração de dados:', error);
  }
}

// Executar a migração
migrateData().catch(console.error);