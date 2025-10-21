import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Send, Plus, Trash2, MessageSquare, Bot, User, X } from 'lucide-react';
import { 
  type ChatConversation,
  type ChatMessage,
  DEFAULT_AI_PROMPT,
  DEFAULT_SETTINGS
} from '@/lib/settings';
import { 
  getDatabaseConversations,
  createDatabaseConversation,
  updateDatabaseConversation,
  deleteDatabaseConversation,
  getDatabaseMessages,
  createDatabaseMessage
} from '@/lib/database-chat';
import { fetchSettings } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


interface AIChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Funções utilitárias para adaptar dados do banco para os tipos do frontend
function adaptDbMessageToChatMessage(dbMsg: any): ChatMessage {
  return {
    id: dbMsg.id,
    role: dbMsg.role === 'user' || dbMsg.role === 'assistant' ? dbMsg.role : 'user',
    content: dbMsg.content,
    timestamp: new Date(dbMsg.timestamp),
  };
}

function adaptDbConversationToChatConversation(dbConv: any, messages: any[] = []): ChatConversation {
  return {
    ...dbConv,
    messages: messages.map(adaptDbMessageToChatMessage),
  };
}

export default function AIChatModal({ open, onOpenChange }: AIChatModalProps) {
  useEffect(() => {
    if (!open) {
      document.body.classList.remove('modal-open');
      // Garante que a classe seja removida mesmo se o evento de fechamento não for disparado
      const cleanup = setTimeout(() => {
        document.body.classList.remove('modal-open');
      }, 150);
      return () => clearTimeout(cleanup);
    }
  }, [open]);

  // Garante que a classe seja removida quando o componente é desmontado
  useEffect(() => {
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  // Estado auxiliar para forçar re-render
  const [, setForceUpdate] = useState(0);

  // Log para depuração visual
  // console.log('RENDER: currentConversation.messages', currentConversation?.messages);

  useEffect(() => {
    const loadSettings = async () => {
      const fetchedSettings = await fetchSettings();
      setSettings(fetchedSettings || DEFAULT_SETTINGS);
    };
    loadSettings();
  }, []);

  // Função utilitária para atualizar conversas e conversa atual a partir do banco
  const syncConversationsFromDb = async (conversationId?: string) => {
    const history = await getDatabaseConversations();
    // Adaptar conversas para garantir tipagem correta
    const conversationsWithMessages: ChatConversation[] = await Promise.all(
      history.map(async (conv: any) => {
        const msgs = await getDatabaseMessages(conv.id);
        return adaptDbConversationToChatConversation(conv, msgs);
      })
    );
    setConversations(conversationsWithMessages);
    if (conversationId) {
      const conv = conversationsWithMessages.find(c => c.id === conversationId);
      if (conv) {
        setCurrentConversation(conv);
      }
    } else if (conversationsWithMessages.length > 0) {
      setCurrentConversation(conversationsWithMessages[0]);
    } else {
      setCurrentConversation(null);
    }
  };

  useEffect(() => {
    if (open) {
      syncConversationsFromDb();
    }
    // Remover dependências que possam causar recarregamento desnecessário
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);



  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateConversationTitle = async (conversationId: string, newTitle: string) => {
    const updatedConversation = await updateDatabaseConversation(conversationId, { title: newTitle });
    if (updatedConversation) {
      // Buscar mensagens para manter o formato correto
      const msgs = await getDatabaseMessages(conversationId);
      const updatedConv = adaptDbConversationToChatConversation(updatedConversation, msgs);
      const updatedConversations = conversations.map(conv => 
        conv.id === conversationId ? updatedConv : conv
      );
      setConversations(updatedConversations);
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(updatedConv);
      }
    }
  };

  const handleNewConversation = async () => {
    const newConv = await createDatabaseConversation("Nova Conversa");
    if (newConv) {
      const conversationWithMessages = adaptDbConversationToChatConversation(newConv, []);
      const updatedConversations = [conversationWithMessages, ...conversations];
      setConversations(updatedConversations);
      setCurrentConversation(conversationWithMessages);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    // Otimista: remover do estado local imediatamente
    setConversations(prevConvs => prevConvs.filter(c => c.id !== conversationId));
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(prev => {
        const updatedConvs = conversations.filter(c => c.id !== conversationId);
        return updatedConvs.length > 0 ? updatedConvs[0] : null;
      });
    }
    // Chamar backend em segundo plano
    deleteDatabaseConversation(conversationId);
  };

  const generateAIResponse = async (userMessage: string, conversationHistory: ChatMessage[]): Promise<string> => {
    if (!settings) return 'Erro: Configurações não carregadas';
    const { useDefaultPersonality, aiBehaviorPrompt, aiPersonalities = [], aiSuggestQuestions } = settings;
    
    console.log('🤖 Gerando resposta com OpenAI...', {
      useDefaultPersonality,
      hasApiKey: !!settings.aiApiKey,
      personalities: aiPersonalities
    });

    // Construir prompt do sistema baseado nas configurações
    let systemPrompt = '';
    
    if (useDefaultPersonality) {
      systemPrompt = DEFAULT_AI_PROMPT;
    } else if (aiBehaviorPrompt && aiBehaviorPrompt.trim()) {
      systemPrompt = aiBehaviorPrompt;
    } else {
      systemPrompt = 'Você é Quele uma assistente útil especializada em marketing digital.';
    }
    
    // Adicionar especialidades ao contexto
    if (aiPersonalities.length > 0) {
      systemPrompt += `\n\nSuas especialidades incluem: ${aiPersonalities.join(', ')}.`;
      systemPrompt += '\nUse essas especialidades para dar respostas mais específicas e relevantes.';
    }
    
    // Adicionar contexto de conversação
    const conversationContext = conversationHistory.slice(-4).map(msg => 
      `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`
    ).join('\n');
    
    if (conversationContext) {
      systemPrompt += `\n\nContexto da conversa anterior:\n${conversationContext}`;
    }

    try {
      // Tentar usar OpenAI API se disponível
      if (settings.aiApiKey) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.aiApiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4", // Using GPT-4 model for better responses
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user", 
                content: userMessage
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        });

        if (response.ok) {
          const data = await response.json();
          let aiResponse = data.choices[0].message.content;
          
          // Adicionar sugestão se habilitado
          if (aiSuggestQuestions) {
            const suggestions = [
              "Posso detalhar mais algum ponto?",
              "Quer exemplos práticos disso?", 
              "Como posso ajudar mais?",
              "Precisa de mais informações?"
            ];
            const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
            aiResponse += `\n\n💡 *${randomSuggestion}*`;
          }
          
          return aiResponse;
        } else {
          console.error('Erro na API OpenAI:', response.status);
          throw new Error('API Error');
        }
      } else {
        throw new Error('No API Key');
      }
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      
      // Fallback: resposta local inteligente baseada nas configurações
      let fallbackResponse = '';
      
      // Extrair nome das configurações para resposta personalizada
      const nameMatch = systemPrompt.match(/nome é ([a-zA-Z]+)/i) || 
                       systemPrompt.match(/sou ([a-zA-Z]+)/i);
      const aiName = nameMatch ? nameMatch[1] : (useDefaultPersonality ? 'Iana' : 'Assistente');
      
      // Resposta contextualizada baseada na pergunta
      const msg = userMessage.toLowerCase();
      
      if (msg.includes('nome') || msg.includes('qual')) {
        fallbackResponse = `Olá! Sou ${aiName}.\n\n${systemPrompt.replace(/Instruções?:?\s*/i, '')}`;
      } else if (msg.includes('ajuda') || msg.includes('como')) {
        fallbackResponse = `Como ${aiName}, posso te ajudar com:\n\n`;
        if (aiPersonalities.length > 0) {
          fallbackResponse += aiPersonalities.map(p => `• ${p}`).join('\n');
        } else {
          fallbackResponse += '• Estratégias de marketing\n• Análise de campanhas\n• Copywriting e vendas';
        }
        fallbackResponse += `\n\nSobre "${userMessage}": O que especificamente você gostaria de saber?`;
      } else {
        fallbackResponse = `Entendi sua pergunta sobre "${userMessage}".\n\n`;
        
        if (aiPersonalities.includes('Marketing Digital')) {
          fallbackResponse += 'Como especialista em marketing digital, recomendo focar em estratégias baseadas em dados e resultados mensuráveis.';
        } else if (aiPersonalities.includes('Copywriting')) {
          fallbackResponse += 'Para copywriting eficaz, sempre comece identificando a dor específica do seu público-alvo.';
        } else {
          fallbackResponse += 'Para uma resposta mais específica, seria útil ter mais detalhes sobre seu contexto e objetivos.';
        }
      }
      
      if (aiSuggestQuestions) {
        fallbackResponse += '\n\nPosso te ajudar com mais alguma coisa específica?';
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      return fallbackResponse;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentConversation || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    // Adicionar mensagem do usuário no banco
    await createDatabaseMessage(currentConversation.id, 'user', userMessage.content);
    // Atualizar estado local imediatamente
    setCurrentConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null);
    setMessage('');
    setIsLoading(true);

    // Atualizar título da conversa com a mensagem do usuário
    await updateConversationTitle(currentConversation.id, userMessage.content.substring(0, 50));
    // Sincronizar conversas e conversa atual do banco
    await syncConversationsFromDb(currentConversation.id);

    try {
      // Gerar resposta da IA usando o histórico mais recente
      const convMsgs = await getDatabaseMessages(currentConversation.id);
      const aiResponse = await generateAIResponse(userMessage.content, convMsgs.map(adaptDbMessageToChatMessage));
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      // Adicionar resposta da IA no banco
      await createDatabaseMessage(currentConversation.id, 'assistant', aiResponse);
      // Atualizar estado local imediatamente
      setCurrentConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, aiMessage]
      } : null);
      // Sincronizar conversas e conversa atual do banco
      await syncConversationsFromDb(currentConversation.id);
    } catch (error) {
      console.error('Erro ao gerar resposta da IA:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        const inputElement = document.querySelector('input[placeholder*="Digite sua mensagem"]') as HTMLInputElement;
        if (inputElement) {
          inputElement.focus();
        }
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift + Enter: quebra linha
        return; // Permite comportamento padrão (nova linha)
      } else {
        // Enter: envia mensagem
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-6xl p-0 gap-0" 
        style={{ height: '90vh', maxHeight: '90vh', overflow: 'hidden' }}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="w-full bg-gray-50 border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bot className="h-6 w-6 text-gray-600" />
            TurboPresell AI Chat
          </h2>
          <DialogClose className="rounded-sm opacity-90 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none bg-blue-200 p-2 hover:bg-blue-300">
            <X className="h-5 w-5 text-blue-800" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
        </div>
        <div className="flex" style={{ height: 'calc(90vh - 64px)' }}>
          {/* Sidebar */}
          <div 
            className="w-80 border-r bg-gray-50 dark:bg-gray-900 flex flex-col"
            style={{ height: '100%' }}
          >
            

            {/* New Conversation Button */}
            <div className="px-4 py-3 border-b flex-shrink-0">
              <Button 
                onClick={handleNewConversation}
                className="w-full justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5" />
                Nova Conversa
              </Button>
            </div>

            {/* AI Configuration Status */}
            <div className="p-3 border-b flex-shrink-0">
              <div className="space-y-2">
                {settings && (
                  <>
                    {/* Especialidades */}
                    {settings.aiPersonalities?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <p className="text-xs text-muted-foreground w-full">Especialidades:</p>
                        {settings.aiPersonalities.slice(0, 3).map(p => (
                          <Badge key={p} variant="outline" className="text-xs">
                            {p}
                          </Badge>
                        ))}
                        {settings.aiPersonalities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{settings.aiPersonalities.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Comportamento */}
                    <div className="flex gap-1">
                      <Badge variant={settings.useDefaultPersonality ? "default" : "secondary"} className="text-xs">
                        {settings.useDefaultPersonality ? "Padrão" : "Customizado"}
                      </Badge>
                      <Badge variant={settings.aiSuggestQuestions ? "default" : "outline"} className="text-xs">
                        {settings.aiSuggestQuestions ? "Sugestões ON" : "Sugestões OFF"}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Conversation History */}
            <div className="flex-1 min-h-0">
              <div 
                className="p-3 overflow-y-auto"
                style={{ height: '100%', maxHeight: 'calc(80vh - 200px)' }}
              >
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Histórico de Conversas</p>
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                        currentConversation?.id === conv.id 
                          ? 'bg-blue-100 dark:bg-blue-900' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={async () => {
                        await syncConversationsFromDb(conv.id);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{conv.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {conv.messages.length} mensagem{conv.messages.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col" style={{ height: '100%' }}>
            {currentConversation ? (
              <>
                {/* Messages */}
                <div 
                  className="flex-1 overflow-y-auto p-4"
                  style={{ 
                    height: 'calc(80vh - 120px)', 
                    maxHeight: 'calc(80vh - 120px)',
                    minHeight: '0'
                  }}
                >
                  <div className="space-y-4">
                    {currentConversation.messages.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">Nova Conversa Iniciada</h3>
                        <p className="text-muted-foreground">
                          Digite sua primeira mensagem para começar a conversar com a IA.
                        </p>
                      </div>
                    ) : (
                      // Renderizar mensagens em ordem crescente (do topo para o fundo)
                      currentConversation.messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="flex-shrink-0">
                              {msg.role === 'user' ? (
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-white" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                  <Bot className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                            <div 
                              className={`px-4 py-3 rounded-2xl ${
                                msg.role === 'user' 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-gray-100 dark:bg-gray-800'
                              }`}
                              style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                            >
                              {msg.role === 'assistant' ? (
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                  <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      table: ({ node, ...props }) => (
                                        <div className="overflow-x-auto">
                                          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props} />
                                        </div>
                                      ),
                                      th: ({ node, ...props }) => (
                                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-50 dark:bg-gray-800" {...props} />
                                      ),
                                      td: ({ node, ...props }) => (
                                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2" {...props} />
                                      ),
                                    }}
                                  >
                                    {msg.content}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <p className="text-sm">{msg.content}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {/* Loader sempre após a última mensagem, sem afetar o array de mensagens */}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input Area */}
                <div className="border-t p-3 flex-shrink-0 bg-gray-50 fixed bottom-0 left-0 right-0 w-full">
                  <div className="flex gap-2 max-w-[calc(100%-2rem)] mx-auto">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={currentConversation ? "Digite sua mensagem..." : "Inicie uma conversa primeiro"}
                      disabled={isLoading || !currentConversation}
                      className="flex-1 h-12 text-base"
                      autoFocus
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isLoading || !currentConversation}
                      className="px-6 h-12"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma conversa ativa</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Inicie uma nova conversa para começar a interagir com a IA especializada em marketing digital.
                </p>
                <Button 
                  onClick={handleNewConversation}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Iniciar Nova Conversa
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}