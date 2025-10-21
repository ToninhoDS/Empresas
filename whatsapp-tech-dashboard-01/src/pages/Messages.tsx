import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { generateMockContacts } from '@/utils/mockData';
import ContactTable from '@/components/contacts/ContactTable';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'react-router-dom';
import { mensagemService } from '@/services/api';
import { useRealtime } from '@/hooks/useRealtime';
import { toast } from '@/hooks/use-toast';

interface Mensagem {
  id: string;
  conteudo: string;
  tipo: string;
  direcao: string;
  status: string;
  data_envio: string;
  cliente: {
    nome: string;
    telefone: string;
  };
  colaborador: {
    nome: string;
  };
}

const Messages = () => {
  const allContacts = generateMockContacts(10);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  
  // Configurar as datas iniciais (hoje)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: today,
    to: today
  });

  const [activeFilter, setActiveFilter] = useState('custom');
  const [activeStatus, setActiveStatus] = useState('todas');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificar se há um contato específico para abrir a partir da URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const contactId = params.get('contact');
    if (contactId) {
      setSelectedContactId(contactId);
      // Aqui você poderia adicionar lógica para abrir um modal de chat
      // ou qualquer outra ação necessária quando um contato específico é selecionado
      console.log(`Contato selecionado: ${contactId}`);
    }
  }, [location]);

  // Mock counters for each tab
  const messageCounts = {
    todas: 35,
    naoLidas: 12,
    aguardando: 8,
    finalizadas: 15
  };

  // Função para atualizar o intervalo de datas baseado no filtro selecionado
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    
    switch (filter) {
      case 'yesterday':
        const yesterday = subDays(today, 1);
        setDateRange({ from: yesterday, to: yesterday });
        break;
      
      case 'week':
        // Encontra a segunda-feira da semana atual
        const monday = startOfWeek(today, { weekStartsOn: 1 });
        // Encontra o domingo da semana atual
        const sunday = endOfWeek(today, { weekStartsOn: 1 });
        setDateRange({ from: monday, to: sunday });
        break;
      
      case 'month':
        // Primeiro e último dia do mês atual
        setDateRange({
          from: startOfMonth(today),
          to: endOfMonth(today)
        });
        break;
      
      default:
        // Mantém as datas selecionadas manualmente
        break;
    }
  };

  // Filtrar contatos pelo intervalo de datas e status
  const filteredContacts = allContacts.filter(contact => {
    const messageDate = new Date(contact.lastMessageTime);
    messageDate.setHours(0, 0, 0, 0);
    
    // Primeiro filtra por data
    const dateMatch = messageDate >= dateRange.from && messageDate <= dateRange.to;
    
    // Depois filtra por status
    if (!dateMatch) return false;
    
    switch (activeStatus) {
      case 'nao-lidas':
        // Simula mensagens não lidas (usando o id como critério para simplificar)
        return parseInt(contact.id) % 3 === 0;
      case 'aguardando':
        // Simula mensagens aguardando resposta
        return parseInt(contact.id) % 3 === 1;
      case 'finalizadas':
        // Simula mensagens finalizadas
        return parseInt(contact.id) % 3 === 2;
      default:
        // Todas as mensagens
        return true;
    }
  });

  const handleNovaMensagem = useCallback((payload: any) => {
    const novaMensagem = payload.new as Mensagem;
    setMensagens(prev => [...prev, novaMensagem]);
  }, []);

  useRealtime('mensagens', 'INSERT', handleNovaMensagem);

  useEffect(() => {
    const carregarMensagens = async () => {
      try {
        // Aqui você deve implementar a lógica para obter o ID do cliente atual
        const clienteId = 123; // Temporário
        const data = await mensagemService.listarPorCliente(clienteId);
        setMensagens(data);
      } catch (error: any) {
        toast({
          title: "Erro ao carregar mensagens",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    carregarMensagens();
  }, []);

  const enviarMensagem = async (conteudo: string) => {
    try {
      const novaMensagem = {
        cliente_id: '123', // Temporário - deve vir do contexto
        conteudo,
        tipo: 'texto',
        direcao: 'saida',
      };

      await mensagemService.enviar(novaMensagem);
      
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Mensagens</h1>
        
        <Card>
          <CardContent className="pt-6">
            {/* Abas de status no estilo WhatsApp */}
            <Tabs value={activeStatus} onValueChange={setActiveStatus} className="w-full mb-6">
              <TabsList className="w-full bg-whatsapp-light/10 p-1.5 rounded-md">
                <TabsTrigger 
                  value="todas" 
                  className="flex-1 py-2 data-[state=active]:bg-whatsapp-light data-[state=active]:text-white"
                  count={messageCounts.todas}
                >
                  Todas
                </TabsTrigger>
                <TabsTrigger 
                  value="nao-lidas" 
                  className="flex-1 py-2 data-[state=active]:bg-whatsapp-light data-[state=active]:text-white"
                  count={messageCounts.naoLidas}
                >
                  Não Lidas
                </TabsTrigger>
                <TabsTrigger 
                  value="aguardando" 
                  className="flex-1 py-2 data-[state=active]:bg-whatsapp-light data-[state=active]:text-white"
                  count={messageCounts.aguardando}
                >
                  Aguardando
                </TabsTrigger>
                <TabsTrigger 
                  value="finalizadas" 
                  className="flex-1 py-2 data-[state=active]:bg-whatsapp-light data-[state=active]:text-white"
                  count={messageCounts.finalizadas}
                >
                  Finalizadas
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col space-y-4 mb-6">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar por nome, telefone ou especialidade..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Data inicial</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => {
                          setActiveFilter('custom');
                          setDateRange(prev => ({ ...prev, from: date || today }));
                        }}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? (
                          format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Data final</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => {
                          setActiveFilter('custom');
                          setDateRange(prev => ({ ...prev, to: date || today }));
                        }}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Tabs value={activeFilter} onValueChange={handleFilterChange} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="yesterday">Ontem</TabsTrigger>
                  <TabsTrigger value="week">Esta Semana</TabsTrigger>
                  <TabsTrigger value="month">Este Mês</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <ContactTable 
              contacts={filteredContacts} 
              searchTerm={searchTerm} 
              selectedContactId={selectedContactId}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
