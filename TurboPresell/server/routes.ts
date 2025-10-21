import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { 
  insertCampaignSchema, 
  updateCampaignSchema, 
  insertSettingsSchema,
  insertChatConversationSchema,
  insertChatMessageSchema
} from "@shared/schema";
import { clonePage, injectCookieModal } from "./services/cloning";
import { captureScreenshots, generateScreenshotHtml } from "./services/screenshots";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve screenshot files statically
  app.use('/screenshots', express.static(path.join(process.cwd(), 'screenshots')));

  // Get all campaigns
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  // Get single campaign
  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  // Create new campaign
  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validatedData);
      
      // Start the cloning/screenshot process asynchronously
      processCampaign(campaign.id);
      
      res.status(201).json(campaign);
    } catch (err) {
      console.error('Erro ao criar campanha:', err);
      res.status(500).json({ message: 'Failed to create campaign' });
    }
  });

  // Update campaign
  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateCampaignSchema.parse(req.body);
      const campaign = await storage.updateCampaign(id, validatedData);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ message: "Invalid campaign data", errors: error });
      } else {
        res.status(500).json({ message: "Failed to update campaign" });
      }
    }
  });

  // Update campaign (PATCH method)
  app.patch("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateCampaignSchema.partial().parse(req.body);
      console.log('PATCH campaign data:', validatedData);
      
      const campaign = await storage.updateCampaign(id, validatedData);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      console.error('Error updating campaign (PATCH):', error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ message: "Invalid campaign data", errors: error });
      } else {
        res.status(500).json({ message: "Failed to update campaign" });
      }
    }
  });

  // Delete campaign
  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCampaign(id);
      // Sempre retorna 204, mesmo se já não existir
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      // For now, assuming user ID 1 (will be replaced with actual user authentication)
      const userId = 1;
      const settings = await storage.getSettings(userId);
      
      if (!settings) {
        // Create default settings if none exist
        const defaultSettings = {
          userId,
          darkMode: false,
          cardEffects: true,
          bulkDeleteProtection: false,
          soundNotifications: false,
          clickSoundFile: "1 - cute_notification_1750530967074.mp3",
          aiApiKey: "",
          aiPersonalities: [],
          aiBehaviorPrompt: "Seu nome: Consultora Liana - Especialista em Marketing de Performance e Presell Pages\n\nFunção e Perfil:\n\nVocê é um Agente de Inteligência Artificial com personalidade de Mentor e Consultor de Alta Performance, especialista em Marketing Digital, Vendas Online, Copywriting de Conversão, E-commerce, Funis de Vendas e Criação de Presell Pages.\n\nSua missão é oferecer respostas práticas, estratégicas e com profundidade de mercado.\n\nCaracterísticas principais:\n\n✅ Especialista em criação de Presell Pages para conversão de tráfego pago.\n✅ Experiência em Vendas Online para o mercado brasileiro e internacional.\n✅ Forte domínio de Copywriting, Gatilhos Mentais e Persuasão para Anúncios e Landing Pages.\n✅ Capacidade de indicar produtos gringos em alta, tendências de mercado, oportunidades emergentes e novidades no setor de marketing digital.\n✅ Atua como um consultor estratégico, capaz de sugerir melhorias, testar ideias e adaptar a linguagem conforme o público-alvo (afiliados, produtores, ecommerces, infoprodutores, etc).\n✅ Também pode trazer exemplos práticos, cases de sucesso, vídeos, links úteis, artigos, ou sugerir pesquisas externas quando o tema exigir.\n✅ Tem liberdade para sair do tema central de Marketing se o usuário quiser mudar de assunto. A prioridade é sempre atender à intenção e necessidade do usuário no momento.\n\nExemplos de tarefas que este agente deve saber realizar bem:\n\n- Sugerir ideias de Presell Pages para diferentes nichos.\n- Analisar tendências de produtos gringos que estão vendendo bem.\n- Gerar textos de anúncios com foco em CPA baixo e ROAS alto.\n- Montar estruturas de Funil de Vendas, principalmente Fundo de Funil (BOFU).\n- Indicar títulos e CTAs de impacto.\n- Ajudar a construir sequências de copy para e-commerce, PLR, lançamentos, etc.\n- Trazer insights de SEO, Google Ads, Meta Ads, etc.\n- Responder sobre novas estratégias de mercado, ferramentas, softwares e oportunidades de negócio.\n- Mudar de assunto, se o usuário desejar, com uma comunicação sempre leve, consultiva e útil.\n\nTom de voz: Amigável, consultivo, direto ao ponto, com foco em resultado e orientação estratégica.",
          aiSuggestQuestions: true,
          useDefaultPersonality: true
        };
        const createdSettings = await storage.createSettings(defaultSettings);
        res.json(createdSettings);
      } else {
        res.json(settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      // For now, assuming user ID 1 (will be replaced with actual user authentication)
      const userId = 1;
      
      // Remove timestamp fields that shouldn't be updated by the client
      const { createdAt, updatedAt, id, ...updates } = req.body;
      
      console.log('Settings update request:', updates);
      
      // Check if settings exist
      const existingSettings = await storage.getSettings(userId);
      
      if (!existingSettings) {
        // Create new settings with validation
        const validatedData = insertSettingsSchema.parse({ ...updates, userId });
        const settings = await storage.createSettings(validatedData);
        res.json(settings);
      } else {
        // Update existing settings
        const settings = await storage.updateSettings(userId, updates);
        if (!settings) {
          return res.status(404).json({ message: "Settings not found" });
        }
        res.json(settings);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ message: "Invalid settings data", errors: error });
      } else {
        res.status(500).json({ message: "Failed to update settings" });
      }
    }
  });

  // Chat conversation routes
  app.get("/api/chat/conversations", async (req, res) => {
    try {
      // For now, assuming user ID 1 (will be replaced with actual user authentication)
      const userId = 1;
      const conversations = await storage.getChatConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching chat conversations:', error);
      res.status(500).json({ message: "Failed to fetch chat conversations" });
    }
  });

  app.post("/api/chat/conversations", async (req, res) => {
    try {
      // For now, assuming user ID 1 (will be replaced with actual user authentication)
      const userId = 1;
      const validatedData = insertChatConversationSchema.parse({ ...req.body, userId });
      const conversation = await storage.createChatConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      console.error('Error creating chat conversation:', error);
      res.status(500).json({ message: "Failed to create chat conversation" });
    }
  });

  app.put("/api/chat/conversations/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const conversation = await storage.updateChatConversation(id, req.body);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error('Error updating chat conversation:', error);
      res.status(500).json({ message: "Failed to update chat conversation" });
    }
  });

  app.delete("/api/chat/conversations/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const success = await storage.deleteChatConversation(id);
      
      if (!success) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting chat conversation:', error);
      res.status(500).json({ message: "Failed to delete chat conversation" });
    }
  });

  // Chat message routes
  app.get("/api/chat/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = req.params.id;
      const messages = await storage.getChatMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = req.params.id;
      const validatedData = insertChatMessageSchema.parse({ ...req.body, conversationId });
      const message = await storage.createChatMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating chat message:', error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });

  // Analytics routes
  app.get("/api/campaigns/:id/analytics", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const { startDate, endDate, groupBy = 'day' } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const grouping = groupBy as 'hour' | 'day' | 'week' | 'month';

      const [viewsData, clicksData] = await Promise.all([
        storage.getCampaignViewsGrouped(campaignId, grouping, start, end),
        storage.getCampaignClicksGrouped(campaignId, grouping, start, end)
      ]);

      res.json({
        views: viewsData,
        clicks: clicksData
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // GET version for query parameters
  app.get("/api/analytics/multi", async (req, res) => {
    try {
      const { campaignIds, startDate, endDate, groupBy = 'day' } = req.query;
      
      if (!campaignIds) {
        return res.status(400).json({ message: "Campaign IDs are required" });
      }

      const ids = (campaignIds as string).split(',').map(id => parseInt(id));
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const grouping = groupBy as 'hour' | 'day' | 'week' | 'month';

      console.log('Analytics request:', { ids, start, end, grouping });

      const results = await Promise.all(
        ids.map(async (campaignId) => {
          try {
            const [viewsData, clicksData] = await Promise.all([
              storage.getCampaignViewsGrouped(campaignId, grouping, start, end),
              storage.getCampaignClicksGrouped(campaignId, grouping, start, end)
            ]);
            
            console.log(`Campaign ${campaignId} analytics:`, { views: viewsData.length, clicks: clicksData.length });
            
            return {
              campaignId,
              views: viewsData,
              clicks: clicksData
            };
          } catch (error) {
            console.error(`Error fetching analytics for campaign ${campaignId}:`, error);
            return {
              campaignId,
              views: [],
              clicks: []
            };
          }
        })
      );

      console.log('Analytics response:', results);
      res.json(results);
    } catch (error) {
      console.error('Error fetching multi-campaign analytics:', error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // POST version for request body
  app.post("/api/analytics/multi", async (req, res) => {
    try {
      const { ids, start, grouping = 'day' } = req.body;
      
      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ message: "Campaign IDs array is required" });
      }

      const startDate = start ? new Date(start) : undefined;
      const groupBy = grouping as 'hour' | 'day' | 'week' | 'month';

      console.log('Analytics request:', { ids, start: startDate, grouping: groupBy });

      const results = await Promise.all(
        ids.map(async (campaignId: number) => {
          try {
            const [viewsData, clicksData] = await Promise.all([
              storage.getCampaignViewsGrouped(campaignId, groupBy, startDate),
              storage.getCampaignClicksGrouped(campaignId, groupBy, startDate)
            ]);
            
            console.log(`Campaign ${campaignId} analytics:`, { views: viewsData.length, clicks: clicksData.length });
            
            return {
              campaignId,
              views: viewsData,
              clicks: clicksData
            };
          } catch (error) {
            console.error(`Error fetching analytics for campaign ${campaignId}:`, error);
            return {
              campaignId,
              views: [],
              clicks: []
            };
          }
        })
      );

      console.log('Analytics response:', results);
      res.json(results);
    } catch (error) {
      console.error('Error fetching multi-campaign analytics:', error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Serve presell page by short URL
  app.get("/p/:shortUrl", async (req, res) => {
    try {
      const { shortUrl } = req.params;
      const campaign = await storage.getCampaignByShortUrl(shortUrl);
      
      if (!campaign || !campaign.isActive) {
        return res.status(404).send("Campaign not found or inactive");
      }

      // Incrementa views e registra histórico
      await storage.incrementCampaignViews(campaign.id);
      await storage.recordView(campaign.id, req.headers['user-agent'], req.ip, req.headers.referer as string);
      
      let htmlContent = '';
      
      if (campaign.cloningStatus === 'success' && campaign.clonedHtml) {
        // Sempre servir HTML clonado com modal de cookie
        htmlContent = injectCookieModal(campaign.clonedHtml, {
          title: campaign.cookieModalTitle || 'Cookie Policy',
          text: campaign.cookieModalText || 'We use cookies to enhance your experience.',
          acceptButtonText: campaign.acceptButtonText || 'Accept',
          closeButtonText: campaign.closeButtonText || 'Close',
          policyLink: campaign.cookiePolicyLink || undefined,
          affiliateUrl: campaign.affiliateUrl,
          campaignId: campaign.id,
          // Parâmetros de estilo
          acceptButtonPosition: campaign.acceptButtonPosition,
          acceptButtonShadow: campaign.acceptButtonShadow,
          closeButtonPosition: campaign.closeButtonPosition,
          closeButtonShadow: campaign.closeButtonShadow,
          backgroundColor: campaign.backgroundColor,
          borderColor: campaign.borderColor,
          shadowIntensity: campaign.shadowIntensity
        });
      } else if (campaign.cloningStatus === 'screenshot-mode' && campaign.screenshotPaths) {
        // Serve screenshot HTML
        const screenshotPaths = JSON.parse(campaign.screenshotPaths);
        htmlContent = generateScreenshotHtml(screenshotPaths, {
          title: campaign.cookieModalTitle || 'Cookie Policy',
          text: campaign.cookieModalText || 'We use cookies to enhance your experience.',
          acceptButtonText: campaign.acceptButtonText || 'Accept',
          closeButtonText: campaign.closeButtonText || 'Close',
          policyLink: campaign.cookiePolicyLink || undefined,
          affiliateUrl: campaign.affiliateUrl,
          campaignId: campaign.id,
          // Parâmetros de estilo
          acceptButtonPosition: campaign.acceptButtonPosition,
          acceptButtonShadow: campaign.acceptButtonShadow,
          closeButtonPosition: campaign.closeButtonPosition,
          closeButtonShadow: campaign.closeButtonShadow,
          backgroundColor: campaign.backgroundColor,
          borderColor: campaign.borderColor,
          shadowIntensity: campaign.shadowIntensity
        });
      } else {
        // Campaign is still processing or failed
        htmlContent = `
          <html>
            <head><title>Processing...</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
              <h1>Campaign is being processed</h1>
              <p>Please check back in a few moments.</p>
              <script>setTimeout(() => window.location.reload(), 5000);</script>
            </body>
          </html>
        `;
      }
      
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    } catch (error) {
      console.error('Error serving presell page:', error);
      res.status(500).send("Internal server error");
    }
  });

  // Incrementar clicks
  app.post("/api/campaigns/:id/click", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await storage.incrementCampaignClicks(id);
      await storage.recordClick(id, req.headers['user-agent'], req.ip, req.headers.referer as string);
      res.status(200).json({ success: true, message: "Click incremented" });
    } catch (error) {
      console.error(`Failed to increment clicks for campaign ${req.params.id}`, error);
      res.status(500).json({ success: false, message: "Failed to increment clicks" });
    }
  });

  // Resetar views
  app.post("/api/campaigns/:id/reset-views", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await storage.resetCampaignViews(id);
      res.status(200).json({ success: true, message: "Views reset" });
    } catch (error) {
      console.error(`Failed to reset views for campaign ${req.params.id}`, error);
      res.status(500).json({ success: false, message: "Failed to reset views" });
    }
  });

  // Resetar clicks
  app.post("/api/campaigns/:id/reset-clicks", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await storage.resetCampaignClicks(id);
      res.status(200).json({ success: true, message: "Clicks reset" });
    } catch (error) {
      console.error(`Failed to reset clicks for campaign ${req.params.id}`, error);
      res.status(500).json({ success: false, message: "Failed to reset clicks" });
    }
  });

  // Reprocess campaign (retry cloning/screenshots)
  app.post("/api/campaigns/:id/reprocess", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Reset status to pending
      await storage.updateCampaign(id, { cloningStatus: "pending" });
      
      // Start processing
      processCampaign(id);
      
      res.json({ message: "Campaign reprocessing started" });
    } catch (error) {
      console.error('Error reprocessing campaign:', error);
      res.status(500).json({ message: "Failed to reprocess campaign" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Async function to process campaign cloning/screenshots
async function processCampaign(campaignId: number) {
  try {
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) return;

    if (campaign.cloningMode === 'screenshot-only') {
      // Skip cloning, go directly to screenshots
      await processWithScreenshots(campaignId, campaign.sourceUrl);
      return;
    }

    // Try cloning first
    const cloneResult = await clonePage(campaign.sourceUrl);
    
    if (cloneResult.success && cloneResult.html) {
      // Cloning successful
      await storage.updateCampaign(campaignId, {
        cloningStatus: 'success',
        clonedHtml: cloneResult.html
      });
    } else {
      // Cloning failed, try screenshots if mode allows
      if (campaign.cloningMode === 'automatic') {
        await processWithScreenshots(campaignId, campaign.sourceUrl);
      } else {
        // Clone-only mode failed
        await storage.updateCampaign(campaignId, {
          cloningStatus: 'failed'
        });
      }
    }
  } catch (error) {
    console.error('Error processing campaign:', error);
    await storage.updateCampaign(campaignId, {
      cloningStatus: 'failed'
    });
  }
}

async function processWithScreenshots(campaignId: number, sourceUrl: string) {
  try {
    const screenshotResult = await captureScreenshots(sourceUrl, campaignId);
    
    if (screenshotResult.success && screenshotResult.paths) {
      await storage.updateCampaign(campaignId, {
        cloningStatus: 'screenshot-mode',
        screenshotPaths: JSON.stringify(screenshotResult.paths)
      });
    } else {
      await storage.updateCampaign(campaignId, {
        cloningStatus: 'failed'
      });
    }
  } catch (error) {
    console.error('Error processing screenshots:', error);
    await storage.updateCampaign(campaignId, {
      cloningStatus: 'failed'
    });
  }
}
