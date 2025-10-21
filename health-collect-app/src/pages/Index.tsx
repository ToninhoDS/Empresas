
import React, { useState, useEffect } from 'react';
import { Bell, ClipboardCheck, Clock, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { getTodayServiceOrders, ServiceOrder } from '@/utils/database';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchTodayOrders();
  }, []);
  
  const fetchTodayOrders = async () => {
    try {
      setLoading(true);
      const orders = await getTodayServiceOrders();
      setServiceOrders(orders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching today service orders:', error);
      toast({
        title: "Erro ao carregar ordens",
        description: "Não foi possível carregar os dados do dia. Tente novamente mais tarde.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  
  // Format the service orders for display
  const todayOrders = serviceOrders
    .slice(0, 3)
    .map((order) => ({
      id: order.cd_os,
      title: order.servico_sol || 'Ordem de serviço',
      description: (order.descricao || '').substring(0, 50) + '...',
      time: new Date(order.solicitacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: order.sit || 'new',
      color: order.sit === 'Concluída' ? 'text-green-400' : (order.sit === 'Pendente' ? 'text-yellow-400' : 'text-red-400')
    }));
  
  return (
    <div className="pb-16">
      {/* Blue Banner with Logo */}
      <div className="bg-app-blue p-8 flex flex-col items-center justify-center relative">
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" className="text-white">
            <Bell size={24} />
          </Button>
        </div>
        
        <div className="bg-app-blue bg-opacity-20 p-6 rounded-full mb-4">
          <ClipboardCheck className="text-white" size={48} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">O.S. Manu</h1>
      </div>
      
      {/* Status Cards */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Ordens em Aberto</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-app-blue rounded-xl p-6 text-center">
            <div className="flex flex-col items-center">
              <ClipboardCheck className="text-white mb-2" size={28} />
              <span className="text-white font-medium">Nova O.S.</span>
            </div>
          </div>
          
          <div className="bg-app-orange rounded-xl p-6 text-center">
            <div className="flex flex-col items-center">
              <Clock className="text-white mb-2" size={28} />
              <span className="text-white font-medium">Pendentes</span>
            </div>
          </div>
          
          <div className="bg-app-green rounded-xl p-6 text-center">
            <div className="flex flex-col items-center">
              <ClipboardCheck className="text-white mb-2" size={28} />
              <span className="text-white font-medium">Concluídas</span>
            </div>
          </div>
          
          <div className="bg-app-red rounded-xl p-6 text-center">
            <div className="flex flex-col items-center">
              <Search className="text-white mb-2" size={28} />
              <span className="text-white font-medium">Pesquisa O.S.</span>
            </div>
          </div>
        </div>
        
        {/* Today's Orders */}
        <h2 className="text-xl font-bold mb-3">O.S. de Hoje</h2>
        {loading ? (
          <div className="text-center p-4 text-white">Carregando...</div>
        ) : todayOrders.length === 0 ? (
          <div className="text-center p-4 text-white">Nenhuma ordem de serviço para hoje</div>
        ) : (
          todayOrders.map((order) => (
            <div key={order.id} className="bg-app-dark rounded-lg p-4 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className={`mr-2 ${order.color}`}>⚙️</span>
                    <h3 className={`font-medium ${order.color}`}>{order.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">{order.description}</p>
                  <div className="flex text-xs text-gray-500 mt-1">
                    <span>{order.id}</span>
                    <span className="mx-2">•</span>
                    <span>{order.time}</span>
                  </div>
                </div>
                <ChevronRight className="text-gray-400" size={20} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Index;
