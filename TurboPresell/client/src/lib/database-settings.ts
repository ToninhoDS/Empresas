import type { Settings, InsertSettings } from "@shared/schema";
import { DEFAULT_AI_PROMPT } from "./settings";

// API functions for database settings
export async function getDatabaseSettings(): Promise<Settings | null> {
  try {
    const response = await fetch('/api/settings');
    if (response.ok) {
      const data = await response.json();
      return Object.keys(data).length > 0 ? data : null;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return null;
  }
}

export async function saveDatabaseSettings(settings: Partial<InsertSettings>): Promise<Settings | null> {
  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    console.error('Erro ao salvar configurações:', response.statusText);
    return null;
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return null;
  }
}

// Initialize default settings if none exist
export async function initializeDefaultSettings(): Promise<Settings | null> {
  const existingSettings = await getDatabaseSettings();
  
  if (!existingSettings) {
    const defaultSettings: Partial<InsertSettings> = {
      userId: 1, // Temporary - use session user
      darkMode: false,
      cardEffects: true,
      bulkDeleteProtection: false,
      soundNotifications: false,
      clickSoundFile: "1 - cute_notification_1750530967074.mp3",
      aiApiKey: "",
      aiPersonalities: [],
      aiBehaviorPrompt: DEFAULT_AI_PROMPT,
      aiSuggestQuestions: true,
      useDefaultPersonality: true
    };
    
    return await saveDatabaseSettings(defaultSettings);
  }
  
  return existingSettings;
}