import { pgTable, varchar, text, serial, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sourceUrl: varchar("source_url", { length: 2048 }).notNull(),
  affiliateUrl: varchar("affiliate_url", { length: 2048 }).notNull(),
  shortUrl: varchar("short_url", { length: 32 }).notNull().unique(),
  cloningMode: varchar("cloning_mode", { length: 32 }).notNull().default("automatic"), // automatic, clone-only, screenshot-only
  isActive: boolean("is_active").notNull().default(true),
  
  // Cookie modal settings
  enableCookieModal: boolean("enable_cookie_modal").notNull().default(true),
  cookieModalLanguage: varchar("cookie_modal_language", { length: 32 }).notNull().default("english"),
  cookieModalTitle: varchar("cookie_modal_title", { length: 255 }).notNull().default("Cookie Policy"),
  cookieModalText: text("cookie_modal_text"),
  cookiePolicyLink: varchar("cookie_policy_link", { length: 2048 }),
  acceptButtonText: varchar("accept_button_text", { length: 64 }).notNull().default("Accept"),
  acceptButtonPosition: varchar("accept_button_position", { length: 32 }).notNull().default("bottom-right"),
  acceptButtonShadow: boolean("accept_button_shadow").notNull().default(true),
  closeButtonText: varchar("close_button_text", { length: 64 }).notNull().default("Close"),
  closeButtonPosition: varchar("close_button_position", { length: 32 }).notNull().default("bottom-left"),
  closeButtonShadow: boolean("close_button_shadow").notNull().default(true),
  backgroundColor: varchar("background_color", { length: 32 }).notNull().default("#ffffff"),
  borderColor: varchar("border_color", { length: 32 }).notNull().default("#e5e7eb"),
  shadowIntensity: integer("shadow_intensity").notNull().default(1),
  
  // Cloning status
  cloningStatus: varchar("cloning_status", { length: 32 }).notNull().default("pending"), // pending, success, failed, screenshot-mode
  clonedHtml: text("cloned_html"),
  screenshotPaths: text("screenshot_paths"), // JSON array of screenshot file paths
  views: integer("views").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela de configurações do usuário
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  darkMode: boolean("dark_mode").notNull().default(false),
  cardEffects: boolean("card_effects").notNull().default(true),
  bulkDeleteProtection: boolean("bulk_delete_protection").notNull().default(false),
  soundNotifications: boolean("sound_notifications").notNull().default(false),
  clickSoundFile: varchar("click_sound_file", { length: 255 }).notNull().default("1 - cute_notification_1750530967074.mp3"),
  aiApiKey: text("ai_api_key").notNull().default(""),
  aiPersonalities: text("ai_personalities").array().notNull().default(sql`'{}'::text[]`),
  aiBehaviorPrompt: text("ai_behavior_prompt").notNull().default(""),
  aiSuggestQuestions: boolean("ai_suggest_questions").notNull().default(true),
  useDefaultPersonality: boolean("use_default_personality").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela de conversas do chat
export const chatConversations = pgTable("chat_conversations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull().default("Nova Conversa"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela de mensagens do chat
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  conversationId: varchar("conversation_id", { length: 255 }).references(() => chatConversations.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Tabela de visualizações históricas
export const campaignViews = pgTable("campaign_views", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id, { onDelete: "cascade" }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userAgent: varchar("user_agent", { length: 500 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  referer: varchar("referer", { length: 500 }),
});

// Tabela de cliques históricos
export const campaignClicks = pgTable("campaign_clicks", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id, { onDelete: "cascade" }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userAgent: varchar("user_agent", { length: 500 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  referer: varchar("referer", { length: 500 }),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  shortUrl: true,
  cloningStatus: true,
  clonedHtml: true,
  screenshotPaths: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCampaignSchema = insertCampaignSchema.partial().extend({
  cloningStatus: z.string().optional(),
  clonedHtml: z.string().nullable().optional(),
  screenshotPaths: z.string().nullable().optional(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSettingsSchema = insertSettingsSchema.partial();

export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  timestamp: true,
});

export const insertCampaignViewSchema = createInsertSchema(campaignViews).omit({
  id: true,
  timestamp: true,
});

export const insertCampaignClickSchema = createInsertSchema(campaignClicks).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type UpdateCampaign = z.infer<typeof updateCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertCampaignView = z.infer<typeof insertCampaignViewSchema>;
export type CampaignView = typeof campaignViews.$inferSelect;
export type InsertCampaignClick = z.infer<typeof insertCampaignClickSchema>;
export type CampaignClick = typeof campaignClicks.$inferSelect;
