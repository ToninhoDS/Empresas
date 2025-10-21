import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Contact } from '@/types/contact';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Image, Info, Phone, MessageSquareText, ExternalLink, History, Search, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import StatusSelectionDialog from '@/components/chat/StatusSelectionDialog';
import { useToast } from '@/hooks/use-toast';

// Criamos uma interface para mensagens
interface Message {
  id: string;
  text: string;
  timestamp: string;
  isFromContact: boolean;
  isRead: boolean;
  mediaType?: 'image' | 'audio' | 'video' | 'document' | null;
  mediaUrl?: string;
}

interface ContactDetailsModalProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (contactId: string, newStatus: string) => void;
  currentStatus?: string;
}

const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({ contact, isOpen, onClose, onUpdateStatus, currentStatus }) => {
  const { toast } = useToast();
  const formatDateTime = (isoString: string) => {
    try {
      return format(new Date(isoString), "dd/MM/yyyy 'às' HH:mm");
    } catch (error) {
      return 'Data desconhecida';
    }
  };

  const [activeTab, setActiveTab] = useState("visao-geral");
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<string>("");
  const [showPredefinedMessages, setShowPredefinedMessages] = useState(false);
  const [showSystemChat, setShowSystemChat] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showSystemMessages, setShowSystemMessages] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusDialogConfig, setStatusDialogConfig] = useState<{
    forceSelection: boolean;
    onComplete: () => void;
  }>({
    forceSelection: false,
    onComplete: () => {},
  });
  
  // Atualizar o comportamento para interceptar o fechamento do modal
  const [preventAutoClose, setPreventAutoClose] = useState(false);

  useEffect(() => {
    // Get user role from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role);
    }
  }, []);
  
  // Reset sidebar visibility when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowSidebar(true);
      setShowPredefinedMessages(false);
      setShowSystemMessages(false);
      setShowSystemChat(false);
    }
  }, [isOpen]);

  // Check if user is an admin
  const isAdmin = userRole.includes('admin') && !userRole.includes('supervisor');

  // Colunas disponíveis para seleção de status
  const availableColumns = [
    { id: 'nao_lidas', title: 'Não Lidas', icon: '🔵' },
    { id: 'aguardando', title: 'Aguardando', icon: '🟠' },
    { id: 'sem_agenda', title: 'Sem Agenda', icon: '⚙️' },
    { id: 'encaixe', title: 'Encaixe', icon: '💬' },
    { id: 'finalizado', title: 'Finalizado', icon: '✅' }
  ];

  // Função para interceptar o fechamento do modal
  const handleModalChange = (open: boolean) => {
    if (!open) {
      // Se estiver tentando fechar o modal
      if (showSystemChat) {
        // Se o chat do sistema estiver aberto, exige seleção de status
        setPreventAutoClose(true);
        handleCloseChat();
        return;
      } else if (statusDialogConfig.forceSelection && showStatusDialog) {
        // Se a seleção de status estiver aberta e for forçada, bloqueia o fechamento
        setPreventAutoClose(true);
        return;
      }
    }
    
    // Fechamento normal em outros casos
    if (!preventAutoClose) {
      onClose();
    }
  };

  // Função para mostrar o diálogo de status com delay
  const showStatusDialogWithDelay = (force: boolean = false, onComplete: () => void = () => {}) => {
    setStatusDialogConfig({ forceSelection: force, onComplete });
    if (force) {
      setShowStatusDialog(true);
    } else {
      setTimeout(() => {
        setShowStatusDialog(true);
      }, 2000);
    }
  };

  // Função para iniciar o chat do sistema
  const handleSystemChat = () => {
    setShowSidebar(false);
    setShowPredefinedMessages(false);
    setShowSystemMessages(false);
    setShowSystemChat(true);
    
    // Status será obrigatório após o chat
    setPreventAutoClose(true);
    
    // Mostrar o diálogo de status após delay (não forçado)
    showStatusDialogWithDelay(false, () => {
      setPreventAutoClose(false);
    });
  };

  // Função para fechar o chat e mostrar diálogo de status
  const handleCloseChat = () => {
    showStatusDialogWithDelay(true, () => {
      // Callback após a seleção do status
      setShowSidebar(true);
      setShowPredefinedMessages(false);
      setShowSystemMessages(false);
      setShowSystemChat(false);
      setPreventAutoClose(false);
    });
  };

  // Modificar o showSidebarAgain para usar a nova função handleCloseChat
  const showSidebarAgain = () => {
    if (showSystemChat) {
      handleCloseChat();
    } else {
      setShowSidebar(true);
      setShowPredefinedMessages(false);
      setShowSystemMessages(false);
      setShowSystemChat(false);
    }
  };

  // Modificar o handleWhatsAppRedirect para incluir o diálogo de status
  const handleWhatsAppRedirect = () => {
    const phone = contact.phoneNumber.replace(/\D/g, '');
    const url = `https://wa.me/${phone}`;
    window.open(url, '_blank');
    
    // Mostrar diálogo de status após redirecionamento para WhatsApp
    showStatusDialogWithDelay(true);
  };

  const handleWhatsAppRedirectWithMessage = (message: string) => {
    const phoneNumber = contact.phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://web.whatsapp.com/send/?phone=${phoneNumber}&text=${encodedMessage}&type=phone_number&app_absent=0`, '_blank');
    showStatusDialogWithDelay();
  };

  // Modificar o handleSystemChatWithMessage para incluir o diálogo de status ao fechar
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
    },
    {
      id: '3',
      text: 'Estou interessado no serviço de consultoria.',
      timestamp: '2023-10-15T10:28:30Z',
      isFromContact: true,
      isRead: true
    },
    {
      id: '4',
      text: 'Ótima escolha! Nossa consultoria oferece análise detalhada e recomendações personalizadas.',
      timestamp: '2023-10-15T10:30:45Z',
      isFromContact: false,
      isRead: true
    },
    {
      id: '5',
      text: 'Posso enviar mais detalhes aqui em um documento.',
      timestamp: '2023-10-15T10:32:10Z',
      isFromContact: false,
      isRead: true,
      mediaType: 'document',
      mediaUrl: '/placeholder.svg'
    },
    {
      id: '6',
      text: 'Aqui está uma imagem do nosso processo de consultoria.',
      timestamp: '2023-10-15T10:35:22Z',
      isFromContact: false,
      isRead: true,
      mediaType: 'image',
      mediaUrl: '/placeholder.svg'
    },
    {
      id: '7',
      text: 'Muito obrigado! Vou analisar e retorno em breve.',
      timestamp: '2023-10-15T11:05:33Z',
      isFromContact: true,
      isRead: true
    }
  ];

  // Filtrando mensagens baseado na pesquisa
  const filteredMessages = searchQuery.trim() === "" 
    ? mockMessages 
    : mockMessages.filter(msg => 
        msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      );

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

  // Função para seleção de status
  const handleStatusSelection = (status: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(contact.id, status);
    }
    toast({
      title: "Status atualizado",
      description: `O contato foi movido para ${status}.`,
    });
    
    // Executar a função de callback após a seleção
    statusDialogConfig.onComplete();
    
    // Fechar o diálogo de status e permitir o fechamento do modal
    setShowStatusDialog(false);
    setPreventAutoClose(false);
    
    // Fechar o modal principal após fechar o diálogo de status
    onClose();
  };

  const handleSystemMessagesClick = () => {
    setShowSidebar(false);
    setShowPredefinedMessages(false);
    setShowSystemMessages(true);
  };

  const handlePredefinedMessagesClick = () => {
    setShowSidebar(false);
    setShowPredefinedMessages(true);
    setShowSystemMessages(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleModalChange}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[1200px] p-0 overflow-hidden flex flex-col h-[90vh] max-h-[900px]">
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
                    className="bg-teal-600 hover:bg-teal-700 text-white flex-1"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Entrar em contato
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showSystemMessages && (
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
                      onClick={() => handleSystemChatWithMessage(message.content)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{message.title}</h4>
                          <p className="text-sm text-gray-600">{message.content}</p>
                        </div>
                        <MessageSquareText className="h-4 w-4 text-gray-400" />
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
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      setSelectedMessage('');
                      setShowSystemChat(true);
                    }}
                  >
                    <MessageSquareText className="w-4 h-4 mr-2" />
                    Iniciar Conversa pelo Sistema
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
                    onClick={handleCloseChat}
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
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" className="text-white hover:bg-[#ffffff1a] p-2 h-auto">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                          <path fill="currentColor" d="M15.9 14.3H15l-.3-.3c1-1.1 1.6-2.7 1.6-4.3 0-3.7-3-6.7-6.7-6.7S3 6 3 9.7s3 6.7 6.7 6.7c1.6 0 3.2-.6 4.3-1.6l.3.3v.8l5.1 5.1 1.5-1.5-5-5.2zm-6.2 0c-2.6 0-4.6-2.1-4.6-4.6s2.1-4.6 4.6-4.6 4.6 2.1 4.6 4.6-2 4.6-4.6 4.6z"></path>
                        </svg>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="text-white hover:bg-[#ffffff1a] p-2 h-auto"
                        onClick={handleCloseChat}
                      >
                        <svg viewBox="0 0 24 24" width="24" height="24">
                          <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-auto p-4" style={{ 
                backgroundColor: '#efeae2',
                backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAAGFBMVEUAAADf39/f39/f39/f39/f39/f39/f39+31NZrAAAACHRSTlMAECAwQFBgcL9JBvYAAAFMSURBVHhendTbjoIwEAbgv0hZjqsCymlXE9aYkADGhNWYGF3f/wE24JKW04x0rm6+pNPON0Oo1/ZfqKrvhfyJDwp5hX8KuYcPhbzCQSE/cKeQT3AKuYEfhfzBaSE/0C3kG/orsUWvkHdYL+QVhkIeYLKQHyiF/EK8kHeIQr4gxEI+ICzEQQhCLAQjxEFwQiwEK8RCsEIcBCvEQbBCLAQrxEGwQhwEI8RDMEIsBCPEQTBCHAQjxEEwQiwEI8RBMEIcBCfEQXBCHAQnxEFwQiwEJ8RCcEIcBCfEQbBCHAQrxEGwQhwEK8RBsEIcBCfEQXBCHAQnxEFwQiwEJ8RCcEIcBCfEQbBCHAQrxEGwQhwEK8RBsEIcBCfEQXBCHAQnxEFwQiwEJ8RCcEIcBCfEQbBCHAQrxEGwQhwEK8RBsEIcBCvEQbBCHAQrxEGwQhwEK8RBsEIcBCvEQbBCHMQ/E/MH0oAGGhJAXiEAAAAASUVORK5CYII=")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '100px'
              }}>
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
                        <p className="text-sm break-words">{msg.text}</p>
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
              </div>

              <div className="p-3 bg-[#f0f2f5] flex items-center gap-2">
                <Button variant="ghost" className="text-[#54656f] hover:bg-[#ffffff1a] p-2 h-auto">
                  <svg viewBox="0 0 24 24" width="26" height="26">
                    <path fill="currentColor" d="M9.153 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-3.204 1.362c-.026-.307-.131 5.218 6.063 5.551 6.066-.25 6.066-5.551 6.066-5.551-6.078 1.416-12.129 0-12.129 0zm11.363 1.108s-.669 1.959-5.051 1.959c-3.505 0-5.388-1.164-5.607-1.959 0 0 5.912 1.055 10.658 0zM11.804 1.011C5.609 1.011.978 6.033.978 12.228s4.826 10.761 11.021 10.761S23.02 18.423 23.02 12.228c.001-6.195-5.021-11.217-11.216-11.217zM12 21.354c-5.273 0-9.381-3.886-9.381-9.159s3.942-9.548 9.215-9.548 9.548 4.275 9.548 9.548c-.001 5.272-4.109 9.159-9.382 9.159zm3.108-9.751c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962z"></path>
                  </svg>
                </Button>
                <Button variant="ghost" className="text-[#54656f] hover:bg-[#ffffff1a] p-2 h-auto">
                  <svg viewBox="0 0 24 24" width="26" height="26">
                    <path fill="currentColor" d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.635.127-.976-.214-.098-.097-.576-.613-.213-.973l7.915-7.917c.818-.817 2.267-.699 3.23.262.5.501.802 1.1.849 1.685.051.573-.156 1.111-.589 1.543l-9.547 9.549a3.97 3.97 0 0 1-2.829 1.171 3.975 3.975 0 0 1-2.83-1.173 3.973 3.973 0 0 1-1.172-2.828c0-1.071.415-2.076 1.172-2.83l7.209-7.211c.157-.157.264-.579.028-.814L11.5 4.36a.572.572 0 0 0-.834.018l-7.205 7.207a5.577 5.577 0 0 0-1.645 3.971z"></path>
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

          <div className="flex h-full">
            {/* Barra lateral com abas - agora com condição para exibição */}
            {showSidebar && (
              <div className="w-56 bg-gray-50 border-r border-gray-200 p-0 flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                  <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-4">
                    <TabsTrigger value="visao-geral" className="justify-start w-full text-gray-600 data-[state=active]:bg-white data-[state=active]:text-black">
                      <Info className="mr-2 h-4 w-4" />
                      Visão geral
                    </TabsTrigger>
                    <TabsTrigger value="historico-mensagens" className="justify-start w-full text-gray-600 data-[state=active]:bg-white data-[state=active]:text-black">
                      <History className="mr-2 h-4 w-4" />
                      Histórico de Mensagens
                    </TabsTrigger>
                    <TabsTrigger value="midia" className="justify-start w-full text-gray-600 data-[state=active]:bg-white data-[state=active]:text-black">
                      <Image className="mr-2 h-4 w-4" />
                      Mídia
                    </TabsTrigger>
                    <TabsTrigger value="arquivos" className="justify-start w-full text-gray-600 data-[state=active]:bg-white data-[state=active]:text-black">
                      <FileText className="mr-2 h-4 w-4" />
                      Arquivos
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            {/* Conteúdo principal - ajustado para ocupar toda a largura quando a barra lateral estiver oculta */}
            <div className="flex-1 overflow-y-auto bg-white">
              <DialogHeader className="p-6 pb-2 border-b border-gray-100">
                <DialogTitle className="text-xl">Detalhes do Contato</DialogTitle>
                <DialogDescription className="text-gray-500">
                  Informações completas sobre o contato
                </DialogDescription>
              </DialogHeader>
              
              <div className="p-6">
                {activeTab === "visao-geral" && (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center space-y-2 mb-6">
                      <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl font-bold">
                        {contact.name.charAt(0)}
                      </div>
                      <h2 className="text-xl font-semibold mt-2">{contact.name}</h2>
                      <p className="text-gray-500">{contact.phoneNumber}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Especialidade</p>
                        <p className="font-medium">{contact.specialty}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Total de Mensagens</p>
                        <p className="font-medium">{contact.totalMessages}</p>
                      </div>
                      
                      <div className="space-y-1 col-span-2">
                        <p className="text-sm text-gray-500">Última Interação</p>
                        <p className="font-medium">{formatDateTime(contact.lastMessageTime)}</p>
                      </div>
                      
                      <div className="space-y-1 col-span-2">
                        <p className="text-sm text-gray-500">Última Mensagem</p>
                        <p className="font-medium">{contact.lastMessage}</p>
                      </div>
                    </div>

                    <Separator className="my-6 bg-gray-200" />

                    <div className="space-y-4">
                      {/* Botões principais (Entrar em contato e Conversar pelo Sistema) */}
                      <div className="flex flex-col gap-3">
                        {isAdmin ? (
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
                        ) : (
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
                                setShowSystemMessages(true);
                              }}
                              className="w-full border-gray-300"
                            >
                              <MessageSquareText className="w-4 h-4 mr-2" />
                              Conversar pelo Sistema
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "historico-mensagens" && (
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Buscar nas mensagens..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                      {filteredMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                          <MessageSquareText className="h-12 w-12 mb-4" />
                          <p>Nenhuma mensagem encontrada</p>
                        </div>
                      ) : (
                        <div className="bg-[#F1F0FB] p-4 rounded-md space-y-4">
                          {filteredMessages.map((message) => (
                            <div key={message.id} className={`flex ${message.isFromContact ? 'justify-start' : 'justify-end'}`}>
                              <div 
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  message.isFromContact 
                                    ? 'bg-white' 
                                    : 'bg-[#F2FCE2]'
                                }`}
                              >
                                {message.mediaType && (
                                  <div className="mb-2">
                                    {message.mediaType === 'image' && (
                                      <div className="relative rounded-md overflow-hidden">
                                        <img 
                                          src={message.mediaUrl} 
                                          alt="Media" 
                                          className="w-full h-auto object-cover rounded-md" 
                                        />
                                      </div>
                                    )}
                                    {message.mediaType === 'document' && (
                                      <div className="flex items-center bg-gray-100 p-2 rounded-md">
                                        <FileText className="h-5 w-5 mr-2 text-gray-500" />
                                        <span className="text-sm">Documento</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                <p className="text-sm">{message.text}</p>
                                <div className="flex items-center justify-end mt-1 space-x-1 text-xs text-gray-500">
                                  <span>{format(new Date(message.timestamp), "HH:mm")}</span>
                                  {!message.isFromContact && message.isRead && (
                                    <span className="text-[#1EAEDB]">✓✓</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "midia" && (
                  <div className="py-4">
                    <h3 className="text-lg font-medium mb-4">Mídia Compartilhada</h3>
                    <div className="bg-gray-100 rounded-lg p-12 text-center">
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Nenhuma mídia disponível</p>
                    </div>
                  </div>
                )}

                {activeTab === "arquivos" && (
                  <div className="py-4">
                    <h3 className="text-lg font-medium mb-4">Arquivos Compartilhados</h3>
                    <div className="bg-gray-100 rounded-lg p-12 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Nenhum arquivo disponível</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <StatusSelectionDialog
        isOpen={showStatusDialog}
        onClose={() => {
          if (!statusDialogConfig.forceSelection) {
            setShowStatusDialog(false);
          }
        }}
        onSelectStatus={handleStatusSelection}
        contactName={contact.name}
        contactPhone={contact.phoneNumber}
        columns={availableColumns}
        forceSelection={statusDialogConfig.forceSelection}
        currentStatus={currentStatus}
      />
    </>
  );
};

export default ContactDetailsModal;
