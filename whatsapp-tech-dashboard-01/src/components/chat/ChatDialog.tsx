import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, MessageSquareText, Lock, Phone, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { userService, UserProfile } from '@/services/userService';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isFromContact: boolean;
  isRead: boolean;
  mediaType?: 'image' | 'audio' | 'video' | 'document' | null;
  mediaUrl?: string;
}

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  specialty?: string;
}

interface ChatDialogProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
  hideCloseButton?: boolean;
}

const ChatDialog: React.FC<ChatDialogProps> = ({ contact, isOpen, onClose, hideCloseButton = false }) => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPredefinedMessages, setShowPredefinedMessages] = useState(false);
  const [showSystemChat, setShowSystemChat] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Get user profile from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      setUserProfile(JSON.parse(user));
    }
  }, []);

  // Reset sidebar visibility when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowSidebar(true);
      setShowPredefinedMessages(false);
      setShowSystemChat(false);
    }
  }, [isOpen]);

  // Check if user has chat permissions
  const canChat = () => {
    return userProfile && !userService.hasPermission(['admin']);
  };

  const handleWhatsAppRedirect = () => {
    // Remover caracteres não numéricos
    const phoneNumber = contact.phoneNumber.replace(/\D/g, '');
    window.open(`https://web.whatsapp.com/send/?phone=${phoneNumber}&type=phone_number&app_absent=0`, '_blank');
  };

  const handleWhatsAppRedirectWithMessage = (message: string) => {
    const phoneNumber = contact.phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://web.whatsapp.com/send/?phone=${phoneNumber}&text=${encodedMessage}&type=phone_number&app_absent=0`, '_blank');
  };

  const handleSystemChatWithMessage = (message: string) => {
    setSelectedMessage(message);
    setShowSystemChat(true);
  };

  // Mensagens pré-definidas de exemplo
  const predefinedMessages = [
    { id: 1, title: "Saudação", content: "Olá! Como posso ajudar?" },
    { id: 2, title: "Agradecimento", content: "Muito obrigado pelo contato!" },
    { id: 3, title: "Confirmação", content: "Confirmo o recebimento da sua mensagem." }
  ];

  // Dados de exemplo para o histórico de mensagens
  const mockMessages: Message[] = [
    {
      id: '1',
      text: 'Olá, gostaria de mais informações sobre seus serviços.',
      timestamp: '2023-10-15T10:23:45Z',
      isFromContact: true,
      isRead: true
    },
    {
      id: '2',
      text: 'Claro! Temos diversos serviços disponíveis. Em qual específico você tem interesse?',
      timestamp: '2023-10-15T10:25:12Z',
      isFromContact: false,
      isRead: true
    }
  ];

  // Component for blocked button with tooltip
  const BlockedButton = ({ children, tooltipText }: { children: React.ReactNode, tooltipText: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative inline-block">
            <Button 
              className="bg-gray-400 hover:bg-gray-400 text-white cursor-not-allowed"
              disabled
            >
              {children}
            </Button>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Lock className="w-5 h-5 text-white" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Função para ocultar a barra lateral
  const hideSidebar = () => {
    setShowSidebar(false);
  };

  // Função para exibir a barra lateral
  const showSidebarAgain = () => {
    setShowSidebar(true);
    setShowPredefinedMessages(false);
    setShowSystemChat(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[1200px] p-0 overflow-hidden flex flex-col h-[90vh] max-h-[900px]">
        {hideCloseButton ? null : (
          <button 
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M18 6L6 18"></path>
              <path d="M6 6l12 12"></path>
            </svg>
            <span className="sr-only">Fechar</span>
          </button>
        )}
        {showPredefinedMessages && (
          <div className="absolute inset-0 z-20 bg-white rounded-md overflow-hidden flex flex-col">
            <DialogHeader className="p-6 pb-2 border-b border-gray-100">
              <DialogTitle className="text-xl">Mensagens Prontas</DialogTitle>
              <DialogDescription className="text-gray-500">
                Selecione uma mensagem para enviar
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-3">
                {predefinedMessages.map(message => (
                  <div 
                    key={message.id} 
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleWhatsAppRedirectWithMessage(message.content)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{message.title}</h4>
                        <p className="text-sm text-gray-600">{message.content}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  className="flex-1 border-gray-300"
                  onClick={showSidebarAgain}
                >
                  Voltar
                </Button>
                <Button 
                  onClick={handleWhatsAppRedirect}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Abrir WhatsApp Web
                </Button>
              </div>
            </div>
          </div>
        )}

        {showSystemChat && (
          <div className="absolute inset-0 z-20 bg-[#efeae2] rounded-md overflow-hidden flex flex-col">
            <DialogHeader className="p-4 pb-4 border-b bg-[#008069] text-white shadow-sm">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  className="mr-2 text-white hover:bg-[#ffffff1a] p-2 h-auto"
                  onClick={showSidebarAgain}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M12 4l1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z"></path>
                  </svg>
                </Button>
                <div className="flex items-center flex-1">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-[#008069] text-xl font-bold mr-3">
                    {contact.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-base font-medium mb-0">{contact.name}</DialogTitle>
                    <DialogDescription className="text-sm text-[#ffffff99] m-0">
                      {contact.phoneNumber}
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 p-6 bg-[#efeae2]">
              <div className="space-y-4">
                {mockMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isFromContact ? 'justify-start' : 'justify-end'}`}>
                    <div 
                      className={`max-w-[65%] rounded-lg p-3 relative shadow-sm ${
                        msg.isFromContact 
                          ? 'bg-white before:content-[""] before:absolute before:left-[-8px] before:top-0 before:border-t-[8px] before:border-t-white before:border-r-[8px] before:border-r-white before:border-l-[8px] before:border-l-transparent before:border-b-[8px] before:border-b-transparent' 
                          : 'bg-[#d9fdd3] before:content-[""] before:absolute before:right-[-8px] before:top-0 before:border-t-[8px] before:border-t-[#d9fdd3] before:border-l-[8px] before:border-l-[#d9fdd3] before:border-r-[8px] before:border-r-transparent before:border-b-[8px] before:border-b-transparent'
                      }`}
                    >
                      {msg.mediaType && (
                        <div className="mb-2">
                          {msg.mediaType === 'image' && (
                            <div className="relative rounded-md overflow-hidden">
                              <img 
                                src={msg.mediaUrl} 
                                alt="Media" 
                                className="w-full h-auto object-cover rounded-md" 
                              />
                            </div>
                          )}
                          {msg.mediaType === 'document' && (
                            <div className="flex items-center bg-gray-100 p-2 rounded-md">
                              <FileText className="h-5 w-5 mr-2 text-gray-500" />
                              <span className="text-sm">Documento</span>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-sm">{msg.text}</p>
                      <div className="flex items-center justify-end mt-1 space-x-1 text-[11px] text-[#667781]">
                        <span>{format(new Date(msg.timestamp), "HH:mm")}</span>
                        {!msg.isFromContact && msg.isRead && (
                          <span className="text-[#53bdeb]">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-3 bg-[#f0f2f5] flex items-center gap-2">
              <Button variant="ghost" className="text-[#54656f] hover:bg-[#ffffff1a] p-2 h-auto">
                <svg viewBox="0 0 24 24" width="26" height="26">
                  <path fill="currentColor" d="M9.153 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-3.204 1.362c-.026-.307-.131 5.218 6.063 5.551 6.066-.25 6.066-5.551 6.066-5.551-6.078 1.416-12.129 0-12.129 0zm11.363 1.108s-.669 1.959-5.051 1.959c-3.505 0-5.388-1.164-5.607-1.959 0 0 5.912 1.055 10.658 0zM11.804 1.011C5.609 1.011.978 6.033.978 12.228s4.826 10.761 11.021 10.761S23.02 18.423 23.02 12.228c.001-6.195-5.021-11.217-11.216-11.217zM12 21.354c-5.273 0-9.381-3.886-9.381-9.159s3.942-9.548 9.215-9.548 9.548 4.275 9.548 9.548c-.001 5.272-4.109 9.159-9.382 9.159zm3.108-9.751c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962z"></path>
                </svg>
              </Button>
              <div className="flex-1 bg-white rounded-lg flex items-center px-4 py-2">
                <Input 
                  placeholder="Digite uma mensagem"
                  className="flex-1 border-0 focus:ring-0 bg-transparent text-[15px] placeholder:text-[#3b4a54]"
                  value={selectedMessage || ''}
                  onChange={(e) => setSelectedMessage(e.target.value)}
                />
              </div>
              <Button 
                className="bg-[#008069] hover:bg-[#006e5c] text-white rounded-full w-10 h-10 p-0 flex items-center justify-center shadow-sm"
              >
                {selectedMessage ? (
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2z"></path>
                  </svg>
                )}
              </Button>
            </div>
          </div>
        )}

        {showSidebar && (
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 pb-2 border-b border-gray-100">
              <DialogTitle className="text-xl">Chat</DialogTitle>
              <DialogDescription className="text-gray-500">
                Escolha como deseja conversar
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 flex-1">
              <div className="flex flex-col gap-3">
                {canChat() ? (
                  <>
                    <Button 
                      onClick={() => {
                        hideSidebar();
                        setShowPredefinedMessages(true);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white w-full"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Entrar em contato
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        hideSidebar();
                        setShowSystemChat(true);
                      }}
                      className="w-full border-gray-300"
                    >
                      <MessageSquareText className="w-4 h-4 mr-2" />
                      Conversar pelo Sistema
                    </Button>
                  </>
                ) : (
                  <>
                    <BlockedButton tooltipText="Administradores não podem enviar mensagens para contatos">
                      <Phone className="w-4 h-4 mr-2" />
                      Entrar em contato
                    </BlockedButton>
                    
                    <BlockedButton tooltipText="Administradores não podem enviar mensagens para contatos">
                      <MessageSquareText className="w-4 h-4 mr-2" />
                      Conversar pelo Sistema
                    </BlockedButton>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog; 