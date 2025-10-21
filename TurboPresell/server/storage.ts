import { 
  users, campaigns, settings, chatConversations, chatMessages, campaignViews, campaignClicks,
  type User, type InsertUser, type Campaign, type InsertCampaign, type UpdateCampaign,
  type Settings, type InsertSettings, type ChatConversation, type InsertChatConversation,
  type ChatMessage, type InsertChatMessage, type CampaignView, type InsertCampaignView,
  type CampaignClick, type InsertCampaignClick
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, gte, lte, count, sql, and } from "drizzle-orm";
import fs from 'fs/promises';
import path from 'path';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Campaign methods
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignByShortUrl(shortUrl: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, updates: UpdateCampaign): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  incrementCampaignViews(id: number): Promise<void>;
  incrementCampaignClicks(id: number): Promise<void>;
  resetCampaignViews(id: number): Promise<void>;
  resetCampaignClicks(id: number): Promise<void>;

  // Settings methods
  getSettings(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: number, updates: Partial<InsertSettings>): Promise<Settings | undefined>;

  // Chat methods
  getChatConversations(userId: number): Promise<ChatConversation[]>;
  getChatConversation(id: string): Promise<ChatConversation | undefined>;
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  updateChatConversation(id: string, updates: Partial<InsertChatConversation>): Promise<ChatConversation | undefined>;
  deleteChatConversation(id: string): Promise<boolean>;
  
  getChatMessages(conversationId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  deleteChatMessages(conversationId: string): Promise<boolean>;

  // Analytics methods
  recordView(campaignId: number, userAgent?: string, ipAddress?: string, referer?: string): Promise<void>;
  recordClick(campaignId: number, userAgent?: string, ipAddress?: string, referer?: string): Promise<void>;
  getCampaignViews(campaignId: number, startDate?: Date, endDate?: Date): Promise<CampaignView[]>;
  getCampaignClicks(campaignId: number, startDate?: Date, endDate?: Date): Promise<CampaignClick[]>;
  getCampaignViewsGrouped(campaignId: number, groupBy: 'hour' | 'day' | 'week' | 'month', startDate?: Date, endDate?: Date): Promise<Array<{period: string, count: number}>>;
  getCampaignClicksGrouped(campaignId: number, groupBy: 'hour' | 'day' | 'week' | 'month', startDate?: Date, endDate?: Date): Promise<Array<{period: string, count: number}>>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private campaigns: Map<number, Campaign>;
  private settings: Map<number, Settings>;
  private chatConversations: Map<string, ChatConversation>;
  private chatMessages: Map<string, ChatMessage>;
  private currentUserId: number;
  private currentCampaignId: number;

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.settings = new Map();
    this.chatConversations = new Map();
    this.chatMessages = new Map();
    this.currentUserId = 1;
    this.currentCampaignId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getCampaignByShortUrl(shortUrl: string): Promise<Campaign | undefined> {
    return Array.from(this.campaigns.values()).find(
      (campaign) => campaign.shortUrl === shortUrl
    );
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentCampaignId++;
    const now = new Date();
    const shortUrl = this.generateShortUrl();
    
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      shortUrl,
      cloningStatus: "pending",
      clonedHtml: null,
      screenshotPaths: null,
      createdAt: now,
      updatedAt: now,
      description: insertCampaign.description || null,
      cloningMode: insertCampaign.cloningMode || "automatic",
      isActive: insertCampaign.isActive ?? true,
      enableCookieModal: insertCampaign.enableCookieModal ?? true,
      cookieModalLanguage: insertCampaign.cookieModalLanguage || "english",
      cookieModalTitle: insertCampaign.cookieModalTitle || "Cookie Policy",
      cookieModalText: insertCampaign.cookieModalText || "We use cookies to enhance your experience.",
      acceptButtonText: insertCampaign.acceptButtonText || "Accept",
      closeButtonText: insertCampaign.closeButtonText || "Close",
      cookiePolicyLink: insertCampaign.cookiePolicyLink || null,
      views: 0,
      clicks: 0,
    };
    
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, updates: UpdateCampaign): Promise<Campaign | undefined> {
    const existing = this.campaigns.get(id);
    if (!existing) return undefined;

    const updated: Campaign = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.campaigns.set(id, updated);
    return updated;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  private generateShortUrl(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async incrementCampaignViews(id: number): Promise<void> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    if (campaign) {
      await db.update(campaigns).set({ views: (campaign.views ?? 0) + 1 }).where(eq(campaigns.id, id));
    }
  }

  async incrementCampaignClicks(id: number): Promise<void> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    if (campaign) {
      await db.update(campaigns).set({ clicks: (campaign.clicks ?? 0) + 1 }).where(eq(campaigns.id, id));
    }
  }

  async resetCampaignViews(id: number): Promise<void> {
    await db.update(campaigns).set({ views: 0 }).where(eq(campaigns.id, id));
  }

  async resetCampaignClicks(id: number): Promise<void> {
    await db.update(campaigns).set({ clicks: 0 }).where(eq(campaigns.id, id));
  }

  // Settings methods - stub implementations for MemStorage
  async getSettings(userId: number): Promise<Settings | undefined> {
    return this.settings.get(userId);
  }

  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const now = new Date();
    const settings: Settings = {
      ...insertSettings,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    this.settings.set(insertSettings.userId, settings);
    return settings;
  }

  async updateSettings(userId: number, updates: Partial<InsertSettings>): Promise<Settings | undefined> {
    const existing = this.settings.get(userId);
    if (!existing) return undefined;

    const updated: Settings = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.settings.set(userId, updated);
    return updated;
  }

  // Chat conversation methods - stub implementations for MemStorage
  async getChatConversations(userId: number): Promise<ChatConversation[]> {
    return Array.from(this.chatConversations.values()).filter(conv => conv.userId === userId);
  }

  async getChatConversation(id: string): Promise<ChatConversation | undefined> {
    return this.chatConversations.get(id);
  }

  async createChatConversation(insertConversation: InsertChatConversation): Promise<ChatConversation> {
    const now = new Date();
    const conversation: ChatConversation = {
      ...insertConversation,
      createdAt: now,
      updatedAt: now,
    };
    this.chatConversations.set(insertConversation.id, conversation);
    return conversation;
  }

  async updateChatConversation(id: string, updates: Partial<InsertChatConversation>): Promise<ChatConversation | undefined> {
    const existing = this.chatConversations.get(id);
    if (!existing) return undefined;

    const updated: ChatConversation = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.chatConversations.set(id, updated);
    return updated;
  }

  async deleteChatConversation(id: string): Promise<boolean> {
    return this.chatConversations.delete(id);
  }

  // Chat message methods - stub implementations for MemStorage
  async getChatMessages(conversationId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(msg => msg.conversationId === conversationId);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const now = new Date();
    const message: ChatMessage = {
      ...insertMessage,
      timestamp: now,
    };
    this.chatMessages.set(insertMessage.id, message);
    return message;
  }

  async deleteChatMessages(conversationId: string): Promise<boolean> {
    const messagesToDelete = Array.from(this.chatMessages.entries())
      .filter(([, msg]) => msg.conversationId === conversationId);
    
    messagesToDelete.forEach(([id]) => this.chatMessages.delete(id));
    return messagesToDelete.length > 0;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async getCampaignByShortUrl(shortUrl: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.shortUrl, shortUrl));
    return campaign || undefined;
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const shortUrl = this.generateShortUrl();
    await db
      .insert(campaigns)
      .values({
        ...insertCampaign,
        shortUrl,
        cloningStatus: "pending",
        clonedHtml: null,
        screenshotPaths: null,
        views: 0,
        clicks: 0,
        enableCookieModal: true, // Garantir que o modal de cookie esteja sempre ativo
      });
    // Buscar o registro recém-inserido pelo shortUrl
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.shortUrl, shortUrl));
    return campaign;
  }

  async updateCampaign(id: number, updates: UpdateCampaign): Promise<Campaign | undefined> {
    try {
      console.log('Atualizando campanha:', id, updates);
      
      // Garantir que os campos booleanos sejam tratados corretamente
      const processedUpdates = { ...updates };
      
      // Converter strings vazias para null em campos de texto
      if (processedUpdates.description === '') processedUpdates.description = null;
      if (processedUpdates.cookiePolicyLink === '') processedUpdates.cookiePolicyLink = null;
      if (processedUpdates.cookiePolicyLink === 'none') processedUpdates.cookiePolicyLink = null;
      
      await db
        .update(campaigns)
        .set({
          ...processedUpdates,
          updatedAt: new Date(),
        })
        .where(eq(campaigns.id, id));
      
      // Buscar o registro atualizado
      const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
      console.log('Campanha atualizada:', campaign);
      return campaign || undefined;
    } catch (error) {
      console.error('Erro ao atualizar campanha:', error);
      throw error;
    }
  }

  async deleteCampaign(id: number): Promise<boolean> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
    // Remover a pasta de screenshots
    const screenshotsDir = path.join(process.cwd(), 'screenshots', `campaign-${id}`);
    try {
      console.log(`[DELETE] process.cwd(): ${process.cwd()}`);
      console.log(`[DELETE] Caminho alvo: ${screenshotsDir}`);
      const exists = await fs.stat(screenshotsDir).then(() => true).catch(() => false);
      console.log(`[DELETE] Pasta existe antes da exclusão? ${exists}`);
      if (exists) {
        await fs.rm(screenshotsDir, { recursive: true, force: true });
        console.log(`[DELETE] Pasta removida com sucesso: ${screenshotsDir}`);
      } else {
        console.log(`[DELETE] Pasta não existe, nada a remover: ${screenshotsDir}`);
      }
    } catch (err) {
      console.error(`[DELETE] Erro ao remover screenshots da campanha ${id} no caminho ${screenshotsDir}:`, err);
    }
    return true;
  }

  private generateShortUrl(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async incrementCampaignViews(id: number): Promise<void> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    if (campaign) {
      await db.update(campaigns).set({ views: (campaign.views ?? 0) + 1 }).where(eq(campaigns.id, id));
    }
  }

  async incrementCampaignClicks(id: number): Promise<void> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    if (campaign) {
      await db.update(campaigns).set({ clicks: (campaign.clicks ?? 0) + 1 }).where(eq(campaigns.id, id));
    }
  }

  async resetCampaignViews(id: number): Promise<void> {
    await db.update(campaigns).set({ views: 0 }).where(eq(campaigns.id, id));
  }

  async resetCampaignClicks(id: number): Promise<void> {
    await db.update(campaigns).set({ clicks: 0 }).where(eq(campaigns.id, id));
  }

  // Settings methods
  async getSettings(userId: number): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.userId, userId));
    return setting || undefined;
  }

  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const [setting] = await db
      .insert(settings)
      .values(insertSettings)
      .returning();
    return setting;
  }

  async updateSettings(userId: number, updates: Partial<InsertSettings>): Promise<Settings | undefined> {
    try {
      // Remove timestamp fields and ensure clean data
      const { createdAt, updatedAt, ...cleanUpdates } = updates as any;
      
      // Add updatedAt timestamp
      const updateData = {
        ...cleanUpdates,
        updatedAt: new Date()
      };
      
      console.log('Database update data:', updateData);
      
      const [setting] = await db
        .update(settings)
        .set(updateData)
        .where(eq(settings.userId, userId))
        .returning();
      return setting || undefined;
    } catch (error) {
      console.error('Error in updateSettings:', error);
      throw error;
    }
  }

  // Chat methods
  async getChatConversations(userId: number): Promise<ChatConversation[]> {
    return await db.select().from(chatConversations).where(eq(chatConversations.userId, userId));
  }

  async getChatConversation(id: string): Promise<ChatConversation | undefined> {
    const [conversation] = await db.select().from(chatConversations).where(eq(chatConversations.id, id));
    return conversation || undefined;
  }

  async createChatConversation(insertConversation: InsertChatConversation): Promise<ChatConversation> {
    const [conversation] = await db
      .insert(chatConversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateChatConversation(id: string, updates: Partial<InsertChatConversation>): Promise<ChatConversation | undefined> {
    const [conversation] = await db
      .update(chatConversations)
      .set(updates)
      .where(eq(chatConversations.id, id))
      .returning();
    return conversation || undefined;
  }

  async deleteChatConversation(id: string): Promise<boolean> {
    const result = await db.delete(chatConversations).where(eq(chatConversations.id, id));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  async getChatMessages(conversationId: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.conversationId, conversationId));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async deleteChatMessages(conversationId: string): Promise<boolean> {
    const result = await db.delete(chatMessages).where(eq(chatMessages.conversationId, conversationId));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  async recordView(campaignId: number, userAgent?: string, ipAddress?: string, referer?: string): Promise<void> {
    await db.insert(campaignViews).values({
      campaignId,
      userAgent,
      ipAddress,
      referer
    });
  }

  async recordClick(campaignId: number, userAgent?: string, ipAddress?: string, referer?: string): Promise<void> {
    await db.insert(campaignClicks).values({
      campaignId,
      userAgent,
      ipAddress,
      referer
    });
  }

  async getCampaignViews(campaignId: number, startDate?: Date, endDate?: Date): Promise<CampaignView[]> {
    let query = db.select().from(campaignViews).where(eq(campaignViews.campaignId, campaignId));
    
    if (startDate) {
      query = query.where(gte(campaignViews.timestamp, startDate));
    }
    if (endDate) {
      query = query.where(lte(campaignViews.timestamp, endDate));
    }
    
    return await query.orderBy(desc(campaignViews.timestamp));
  }

  async getCampaignClicks(campaignId: number, startDate?: Date, endDate?: Date): Promise<CampaignClick[]> {
    let query = db.select().from(campaignClicks).where(eq(campaignClicks.campaignId, campaignId));
    
    if (startDate) {
      query = query.where(gte(campaignClicks.timestamp, startDate));
    }
    if (endDate) {
      query = query.where(lte(campaignClicks.timestamp, endDate));
    }
    
    return await query.orderBy(desc(campaignClicks.timestamp));
  }

  async getCampaignViewsGrouped(campaignId: number, groupBy: 'hour' | 'day' | 'week' | 'month', startDate?: Date, endDate?: Date): Promise<Array<{period: string, count: number}>> {
    try {
      let dateGrouping: string;
      let dateFormat: string;
      
      switch (groupBy) {
        case 'hour':
          dateGrouping = "date_trunc('hour', timestamp)";
          dateFormat = "YYYY-MM-DD HH24:00:00";
          break;
        case 'day':
          dateGrouping = "date_trunc('day', timestamp)";
          dateFormat = "YYYY-MM-DD";
          break;
        case 'week':
          dateGrouping = "date_trunc('week', timestamp)";
          dateFormat = "YYYY-MM-DD";
          break;
        case 'month':
          dateGrouping = "date_trunc('month', timestamp)";
          dateFormat = "YYYY-MM";
          break;
      }

      // Use parameterized query with proper date handling
      if (startDate && endDate) {
        const result = await pool`
          SELECT 
            to_char(${pool.unsafe(dateGrouping)}, ${dateFormat}) as period,
            COUNT(*) as count
          FROM campaign_views 
          WHERE campaign_id = ${campaignId}
            AND timestamp >= ${startDate.toISOString()}
            AND timestamp <= ${endDate.toISOString()}
          GROUP BY ${pool.unsafe(dateGrouping)}
          ORDER BY ${pool.unsafe(dateGrouping)}
        `;
        return result.map(r => ({ period: r.period, count: Number(r.count) }));
      } else if (startDate) {
        const result = await pool`
          SELECT 
            to_char(${pool.unsafe(dateGrouping)}, ${dateFormat}) as period,
            COUNT(*) as count
          FROM campaign_views 
          WHERE campaign_id = ${campaignId}
            AND timestamp >= ${startDate.toISOString()}
          GROUP BY ${pool.unsafe(dateGrouping)}
          ORDER BY ${pool.unsafe(dateGrouping)}
        `;
        return result.map(r => ({ period: r.period, count: Number(r.count) }));
      } else {
        const result = await pool`
          SELECT 
            to_char(${pool.unsafe(dateGrouping)}, ${dateFormat}) as period,
            COUNT(*) as count
          FROM campaign_views 
          WHERE campaign_id = ${campaignId}
          GROUP BY ${pool.unsafe(dateGrouping)}
          ORDER BY ${pool.unsafe(dateGrouping)}
        `;
        return result.map(r => ({ period: r.period, count: Number(r.count) }));
      }
    } catch (error) {
      console.error('Error in getCampaignViewsGrouped:', error);
      return [];
    }
  }

  async getCampaignClicksGrouped(campaignId: number, groupBy: 'hour' | 'day' | 'week' | 'month', startDate?: Date, endDate?: Date): Promise<Array<{period: string, count: number}>> {
    try {
      let dateGrouping: string;
      let dateFormat: string;
      
      switch (groupBy) {
        case 'hour':
          dateGrouping = "date_trunc('hour', timestamp)";
          dateFormat = "YYYY-MM-DD HH24:00:00";
          break;
        case 'day':
          dateGrouping = "date_trunc('day', timestamp)";
          dateFormat = "YYYY-MM-DD";
          break;
        case 'week':
          dateGrouping = "date_trunc('week', timestamp)";
          dateFormat = "YYYY-MM-DD";
          break;
        case 'month':
          dateGrouping = "date_trunc('month', timestamp)";
          dateFormat = "YYYY-MM";
          break;
      }

      // Use parameterized query with proper date handling
      if (startDate && endDate) {
        const result = await pool`
          SELECT 
            to_char(${pool.unsafe(dateGrouping)}, ${dateFormat}) as period,
            COUNT(*) as count
          FROM campaign_clicks 
          WHERE campaign_id = ${campaignId}
            AND timestamp >= ${startDate.toISOString()}
            AND timestamp <= ${endDate.toISOString()}
          GROUP BY ${pool.unsafe(dateGrouping)}
          ORDER BY ${pool.unsafe(dateGrouping)}
        `;
        return result.map(r => ({ period: r.period, count: Number(r.count) }));
      } else if (startDate) {
        const result = await pool`
          SELECT 
            to_char(${pool.unsafe(dateGrouping)}, ${dateFormat}) as period,
            COUNT(*) as count
          FROM campaign_clicks 
          WHERE campaign_id = ${campaignId}
            AND timestamp >= ${startDate.toISOString()}
          GROUP BY ${pool.unsafe(dateGrouping)}
          ORDER BY ${pool.unsafe(dateGrouping)}
        `;
        return result.map(r => ({ period: r.period, count: Number(r.count) }));
      } else {
        const result = await pool`
          SELECT 
            to_char(${pool.unsafe(dateGrouping)}, ${dateFormat}) as period,
            COUNT(*) as count
          FROM campaign_clicks 
          WHERE campaign_id = ${campaignId}
          GROUP BY ${pool.unsafe(dateGrouping)}
          ORDER BY ${pool.unsafe(dateGrouping)}
        `;
        return result.map(r => ({ period: r.period, count: Number(r.count) }));
      }
    } catch (error) {
      console.error('Error in getCampaignClicksGrouped:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
