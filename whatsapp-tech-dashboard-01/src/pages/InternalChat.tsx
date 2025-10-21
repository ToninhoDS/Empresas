import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, User, Bell, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { userService, UserProfile } from '@/services/userService';

interface ChatMessage {
  id: number;
  sender: string;
  senderRole: 'admin' | 'supervisor' | 'agent';
  receiver: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

const InternalChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Get user info from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      setUserProfile(JSON.parse(user));
    }

    // Carregar mensagens de exemplo baseadas no perfil do usuário
    setMessages([
      { 
        id: 1, 
        sender: "Admin", 
        senderRole: "admin",
        receiver: "Todos", 
        content: "Lembrem-se de verificar todas as mensagens pendentes antes do fim do expediente.", 
        timestamp: "2023-06-15 14:30",
        isRead: true
      },
      { 
        id: 2, 
        sender: "Maria Silva", 
        senderRole: "supervisor",
        receiver: "João Santos", 
        content: "João, por favor responda ao paciente do leito 302 com urgência.", 
        timestamp: "2023-06-15 15:45",
        isRead: false
      },
      { 
        id: 3, 
        sender: "João Santos", 
        senderRole: "agent",
        receiver: "Maria Silva", 
        content: "Respondido, obrigado pelo aviso!", 
        timestamp: "2023-06-15 15:50",
        isRead: true
      },
    ]);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newId = Math.max(0, ...messages.map(m => m.id)) + 1;
    const now = new Date().toLocaleString('pt-BR').replace(',', '');
    
    const newChatMessage: ChatMessage = {
      id: newId,
      sender: userProfile?.nome || '',
      senderRole: userProfile?.cargo as 'admin' | 'supervisor' | 'agent',
      receiver: "Supervisor", // Simplified for demo - would be dynamically selected
      content: newMessage,
      timestamp: now,
      isRead: false
    };
    
    setMessages(prev => [...prev, newChatMessage]);
    setNewMessage('');

    // Reset textarea height after sending
    if (messageInputRef.current) {
      messageInputRef.current.style.height = 'auto';
    }
  };

  const handleDeleteMessage = (id: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    toast({
      title: "Mensagem excluída",
      description: "A mensagem foi excluída com sucesso."
    });
  };

  // Modify this to NOT send on Enter, just add a newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Don't prevent default to allow natural newline behavior
      // Don't auto-send
    }
  };

  // Helper function to get the appropriate message based on role
  const getRoleBasedMessage = () => {
    if (!userProfile) return '';

    switch(userProfile.cargo) {
      case 'admin':
        return 'Como administrador, você pode enviar mensagens para todos os usuários.';
      case 'supervisor':
        return 'Como supervisor, você pode enviar mensagens para seu departamento ou para o administrador.';
      case 'agent':
        return 'Como atendente, você pode enviar mensagens apenas para seu supervisor.';
      default:
        return '';
    }
  };

  // Filter messages based on role and permissions
  const getFilteredMessages = (type: 'received' | 'sent') => {
    if (!userProfile) return [];

    if (type === 'received') {
      return messages.filter(msg => 
        msg.receiver === userProfile.nome || 
        msg.receiver === "Todos" ||
        (userProfile.cargo === 'supervisor' && msg.receiver.includes('Supervisor')) ||
        (userProfile.cargo === 'admin' && true) // Admin vê todas as mensagens
      );
    } else {
      return messages.filter(msg => msg.sender === userProfile.nome);
    }
  };

  // Auto resize textarea
  const autoResizeTextarea = () => {
    if (messageInputRef.current) {
      messageInputRef.current.style.height = 'auto';
      messageInputRef.current.style.height = `${messageInputRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [newMessage]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Chat Interno</h1>
        
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="received" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Recebidas
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center">
              <Send className="mr-2 h-4 w-4" />
              Enviadas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="received" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mensagens Recebidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
                  {getFilteredMessages('received').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma mensagem recebida
                    </div>
                  ) : (
                    getFilteredMessages('received').map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`p-4 rounded-lg ${
                          msg.isRead ? 'bg-gray-100' : 'bg-blue-50 border-l-4 border-blue-500'
                        }`}
                      >
                        <div className="flex justify-between mb-2">
                          <div className="font-medium flex items-center">
                            <div className={`h-8 w-8 rounded-full ${
                              msg.senderRole === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : msg.senderRole === 'supervisor' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                            } flex items-center justify-center mr-2`}>
                              <User size={16} />
                            </div>
                            {msg.sender}
                          </div>
                          <span className="text-xs text-gray-500">
                            {msg.timestamp}
                          </span>
                        </div>
                        <p className="text-gray-700 break-words whitespace-pre-wrap">{msg.content}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {msg.isRead ? 'Lida' : 'Não lida'}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteMessage(msg.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Excluir mensagem
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sent" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mensagens Enviadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
                  {getFilteredMessages('sent').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma mensagem enviada
                    </div>
                  ) : (
                    getFilteredMessages('sent').map((msg) => (
                      <div 
                        key={msg.id} 
                        className="p-4 rounded-lg bg-gray-100"
                      >
                        <div className="flex justify-between mb-2">
                          <div className="font-medium">
                            Para: {msg.receiver}
                          </div>
                          <span className="text-xs text-gray-500">
                            {msg.timestamp}
                          </span>
                        </div>
                        <p className="text-gray-700 break-words whitespace-pre-wrap">{msg.content}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {msg.isRead ? 'Lida' : 'Não lida'}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteMessage(msg.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Excluir mensagem
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-2">
              <div className="relative">
                <Textarea
                  ref={messageInputRef}
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full min-h-[60px] max-h-[200px] resize-none"
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {getRoleBasedMessage()}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InternalChat;
