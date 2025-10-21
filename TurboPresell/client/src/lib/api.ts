import { queryClient } from './queryClient';

export interface DatabaseSettings {
  id: number;
  userId: number;
  darkMode: boolean;
  cardEffects: boolean;
  bulkDeleteProtection: boolean;
  soundNotifications: boolean;
  clickSoundFile: string;
  aiApiKey: string;
  aiPersonalities: string[];
  aiBehaviorPrompt: string;
  aiSuggestQuestions: boolean;
  useDefaultPersonality: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatConversation {
  id: string;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Settings API
export async function fetchSettings(): Promise<DatabaseSettings | null> {
  try {
    const response = await fetch('/api/settings');
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

export async function saveSettings(settings: Partial<DatabaseSettings>): Promise<DatabaseSettings> {
  // Remove client-side timestamp fields that can cause conflicts
  const { id, createdAt, updatedAt, ...cleanSettings } = settings;
  
  console.log('Sending settings to API:', cleanSettings);
  
  const response = await fetch('/api/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cleanSettings),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Settings save error:', errorText);
    throw new Error('Failed to save settings');
  }

  return await response.json();
}

// Chat API
export async function fetchChatConversations(): Promise<ChatConversation[]> {
  const response = await fetch('/api/chat/conversations');
  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }
  return await response.json();
}

export async function createChatConversation(conversation: { id: string; title: string }): Promise<ChatConversation> {
  const response = await fetch('/api/chat/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(conversation),
  });

  if (!response.ok) {
    throw new Error('Failed to create conversation');
  }

  return await response.json();
}

export async function updateChatConversation(id: string, updates: { title?: string }): Promise<ChatConversation> {
  const response = await fetch(`/api/chat/conversations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update conversation');
  }

  return await response.json();
}

export async function deleteChatConversation(id: string): Promise<void> {
  const response = await fetch(`/api/chat/conversations/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete conversation');
  }
}

export async function fetchChatMessages(conversationId: string): Promise<ChatMessage[]> {
  const response = await fetch(`/api/chat/conversations/${conversationId}/messages`);
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return await response.json();
}

export async function createChatMessage(conversationId: string, message: { id: string; role: 'user' | 'assistant'; content: string }): Promise<ChatMessage> {
  const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error('Failed to create message');
  }

  return await response.json();
}