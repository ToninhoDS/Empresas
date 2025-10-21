import type { ChatConversation, InsertChatConversation, ChatMessage, InsertChatMessage } from "@shared/schema";
import { nanoid } from "nanoid";

// Chat Conversations API
export async function getDatabaseConversations(): Promise<ChatConversation[]> {
  try {
    const response = await fetch('/api/chat/conversations');
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    return [];
  }
}

export async function createDatabaseConversation(title: string = "Nova Conversa"): Promise<ChatConversation | null> {
  try {
    const conversation: InsertChatConversation = {
      id: nanoid(),
      userId: 1, // Temporary - use session user
      title
    };
    
    const response = await fetch('/api/chat/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversation)
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    console.error('Erro ao criar conversa:', response.statusText);
    return null;
  } catch (error) {
    console.error('Erro ao criar conversa:', error);
    return null;
  }
}

export async function updateDatabaseConversation(id: string, updates: Partial<InsertChatConversation>): Promise<ChatConversation | null> {
  try {
    const response = await fetch(`/api/chat/conversations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    console.error('Erro ao atualizar conversa:', response.statusText);
    return null;
  } catch (error) {
    console.error('Erro ao atualizar conversa:', error);
    return null;
  }
}

export async function deleteDatabaseConversation(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/chat/conversations/${id}`, {
      method: 'DELETE'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Erro ao deletar conversa:', error);
    return false;
  }
}

// Chat Messages API
export async function getDatabaseMessages(conversationId: string): Promise<ChatMessage[]> {
  try {
    const response = await fetch(`/api/chat/conversations/${conversationId}/messages`);
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return [];
  }
}

export async function createDatabaseMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<ChatMessage | null> {
  try {
    const message: Omit<InsertChatMessage, 'conversationId'> = {
      id: nanoid(),
      role,
      content
    };
    
    const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    console.error('Erro ao criar mensagem:', response.statusText);
    return null;
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    return null;
  }
}

// Migration function from localStorage to database