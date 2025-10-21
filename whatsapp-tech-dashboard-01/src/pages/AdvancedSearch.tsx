import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Send, PlusCircle, FileText, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  isActive: boolean;
  avatarIcon?: React.ReactNode;
}

// Robot icons for AI avatar
const robotIcons = [
  { icon: '🤖', color: 'bg-blue-100 text-blue-600' },
  { icon: '🦾', color: 'bg-green-100 text-green-600' },
  { icon: '🧠', color: 'bg-purple-100 text-purple-600' },
  { icon: '💻', color: 'bg-amber-100 text-amber-600' },
  { icon: '🔍', color: 'bg-red-100 text-red-600' },
];

const getRandomRobotIcon = () => {
  return robotIcons[Math.floor(Math.random() * robotIcons.length)];
};

const AdvancedSearch: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Como posso ajudar?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Nova Conversa AI',
      preview: 'Olá! Como posso ajudar?',
      timestamp: new Date(),
      isActive: true,
      avatarIcon: getRandomRobotIcon().icon,
    },
  ]);
  const [confirmNewChatOpen, setConfirmNewChatOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      let responseContent = '';
      
      if (input.toLowerCase().includes('últimos 7 dias') || input.toLowerCase().includes('ultimos 7 dias')) {
        responseContent = 'Aqui está a lista de clientes que entraram em contato nos últimos 7 dias:\n\n1. João Silva - 11/05/2023\n2. Maria Oliveira - 12/05/2023\n3. Carlos Santos - 13/05/2023\n4. Ana Pereira - 14/05/2023\n5. Lucas Ferreira - 15/05/2023';
      } else if (input.toLowerCase().includes('pendentes') || input.toLowerCase().includes('dia')) {
        responseContent = 'Encontrei os seguintes atendimentos pendentes para o dia especificado:\n\n- Atendimento #1224 - Cliente: Roberto Almeida - Assunto: Renovação\n- Atendimento #1230 - Cliente: Carla Mendes - Assunto: Instalação\n- Atendimento #1235 - Cliente: Fernando Gomes - Assunto: Suporte técnico';
      } else if (input.toLowerCase().includes('total') || input.toLowerCase().includes('estatísticas') || input.toLowerCase().includes('estatisticas')) {
        responseContent = 'Estatísticas de atendimento:\n\nTotal de atendimentos: 156\nAtendimentos concluídos: 132\nAtendimentos pendentes: 24\nTempo médio de resposta: 15 minutos\nSatisfação do cliente: 4.7/5';
      } else {
        responseContent = 'Entendi sua pergunta. Para te ajudar melhor, poderia especificar um período ou adicionar mais detalhes sobre os dados que está buscando?';
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      // Update session preview
      setSessions(prev => 
        prev.map(session => 
          session.isActive 
            ? {...session, preview: responseContent.substring(0, 30) + '...'}
            : session
        )
      );
    }, 1000);
  };

  const createNewChat = () => {
    // Set all sessions to inactive
    setSessions(prev => prev.map(session => ({...session, isActive: false})));
    
    // Create new session with random robot icon
    const robotIcon = getRandomRobotIcon();
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Nova Conversa AI',
      preview: 'Iniciar uma nova conversa...',
      timestamp: new Date(),
      isActive: true,
      avatarIcon: robotIcon.icon,
    };
    
    setSessions(prev => [newSession, ...prev]);
    
    // Reset messages
    setMessages([{
      id: Date.now().toString(),
      content: 'Olá! Como posso ajudar?',
      sender: 'ai',
      timestamp: new Date(),
    }]);
    
    // Close confirmation dialog
    setConfirmNewChatOpen(false);
  };

  const selectSession = (id: string) => {
    // Set selected session to active and others to inactive
    setSessions(prev => 
      prev.map(session => ({
        ...session, 
        isActive: session.id === id
      }))
    );
    
    // In a real app, you would load messages for this session from the backend
    setMessages([
      {
        id: '1',
        content: 'Olá! Como posso ajudar?',
        sender: 'ai',
        timestamp: new Date(),
      }
    ]);
  };

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-70px)] overflow-hidden">
        {/* Left Sidebar - Chat List */}
        <div className="w-80 bg-gray-900 text-white flex flex-col border-r border-gray-700">
          <div className="p-4 flex flex-col gap-4">
            <h2 className="text-xl font-bold">Consulta Avançada</h2>
            
            {/* Botão Nova Conversa posicionado antes da busca */}
            <Button 
              variant="outline" 
              className="flex items-center gap-2 w-full justify-start border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
              onClick={() => setConfirmNewChatOpen(true)}
            >
              <PlusCircle size={18} />
              Nova Conversa
            </Button>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar conversa..." 
                className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredSessions.map((session) => (
              <div 
                key={session.id}
                onClick={() => selectSession(session.id)}
                className={cn(
                  "p-3 hover:bg-gray-800 cursor-pointer relative",
                  session.isActive && "bg-gray-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-whatsapp-light">
                    <AvatarFallback>{session.avatarIcon || '🤖'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium truncate">{session.title}</p>
                      <span className="text-xs text-gray-400">
                        {session.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{session.preview}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right Area - Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="border-b p-4 flex justify-between items-center">
            <h3 className="font-semibold">Nova Conversa AI</h3>
            <Button variant="outline" size="sm" className="gap-2">
              <FileText size={16} />
              Exportar Conversa
            </Button>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={cn(
                  "flex",
                  message.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div 
                  className={cn(
                    "max-w-[70%] p-3 rounded-lg",
                    message.sender === 'user' 
                      ? "bg-whatsapp text-white rounded-tr-none" 
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  )}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                  <div 
                    className={cn(
                      "text-xs mt-1",
                      message.sender === 'user' ? "text-gray-200" : "text-gray-500"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area - Usando Textarea em vez de Input para permitir quebras de linha */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea 
                placeholder="Digite sua mensagem..." 
                className="flex-1 min-h-[60px] resize-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  // Removida a funcionalidade de enviar ao pressionar ENTER
                  // Agora ENTER apenas cria uma nova linha
                }}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={input.trim() === ''}
                className="bg-whatsapp hover:bg-whatsapp-dark self-end h-10"
              >
                <Send size={18} />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Dica: Pergunte sobre dados específicos como "Quais clientes entraram em contato nos últimos 7 dias?" ou "Mostre os atendimentos pendentes no dia X."
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for New Chat */}
      <AlertDialog open={confirmNewChatOpen} onOpenChange={setConfirmNewChatOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Iniciar Nova Conversa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja iniciar uma nova conversa? A conversa atual será salva, mas você será redirecionado para uma nova.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={createNewChat}>Iniciar Nova Conversa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdvancedSearch;
