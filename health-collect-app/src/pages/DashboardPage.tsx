
import React, { useState, useEffect } from 'react';
import { Bell, ClipboardList, Clock, Search, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import OrderDetailModal from '@/components/OrderDetailModal';
import { getAllServiceOrders, getTodayServiceOrders, ServiceOrder } from '@/utils/database';
import { convertToOrderDetail } from '@/types/orders';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayServiceOrders();
  }, []);

  const loadTodayServiceOrders = async () => {
    try {
      setLoading(true);
      // Usar a função específica para pegar ordens do dia atual
      const orders = await getTodayServiceOrders();
      setServiceOrders(orders);
      setLoading(false);
    } catch (error) {
      console.error('Error loading service orders:', error);
      toast({
        title: "Erro ao carregar ordens",
        description: "Não foi possível carregar os dados. Tente novamente mais tarde.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleOrderClick = (order: ServiceOrder) => {
    setSelectedOrder(convertToOrderDetail(order));
    setIsModalOpen(true);
  };

  const navigateToTab = (tab: string) => {
    navigate(`/coletas?tab=${tab}`);
  };
  
  // Get today's orders - show only the 3 most recent if there are more than 3
  const todaysOrders = serviceOrders
    .slice(0, 3)
    .map((order) => ({
      ...order,
      formattedTime: new Date(order.solicitacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      color: order.sit === 'Concluída' ? 'text-green-400' : (order.sit === 'Pendente' ? 'text-yellow-400' : 'text-red-400'),
      icon: '🔧'
    }));
  
  return (
    <div className="pb-16">
      {/* Status Cards */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Ordens em Aberto</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            className="bg-app-blue rounded-xl p-6 text-center h-auto flex flex-col items-center" 
            onClick={() => navigateToTab('novas')}
          >
            <ClipboardList className="text-white mb-2" size={28} />
            <span className="text-white font-medium">Nova O.S.</span>
          </Button>
          
          <Button 
            className="bg-app-orange rounded-xl p-6 text-center h-auto flex flex-col items-center"
            onClick={() => navigateToTab('pendentes')}
          >
            <Clock className="text-white mb-2" size={28} />
            <span className="text-white font-medium">Pendentes</span>
          </Button>
          
          <Button 
            className="bg-app-green rounded-xl p-6 text-center h-auto flex flex-col items-center"
            onClick={() => navigateToTab('concluidas')}
          >
            <CheckCircle className="text-white mb-2" size={28} />
            <span className="text-white font-medium">Concluídas</span>
          </Button>
          
          <Button 
            className="bg-app-red rounded-xl p-6 text-center h-auto flex flex-col items-center"
            onClick={() => navigateToTab('pesquisa')}
          >
            <Search className="text-white mb-2" size={28} />
            <span className="text-white font-medium">Pesquisa O.S.</span>
          </Button>
        </div>
        
        {/* Today's Orders */}
        <h2 className="text-xl font-bold mb-3">O.S. de Hoje</h2>
        {loading ? (
          <div className="text-center p-4 text-white">Carregando...</div>
        ) : todaysOrders.length === 0 ? (
          <div className="text-center p-4 text-white">Nenhuma ordem de serviço para hoje</div>
        ) : (
          todaysOrders.map((order) => (
            <div key={order.cd_os} className="bg-app-dark rounded-lg p-4 mb-3" 
                onClick={() => handleOrderClick(order)}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className={`mr-2 ${order.color}`}>{order.icon}</span>
                    <h3 className={`font-medium ${order.color}`}>{order.servico_sol || 'Ordem de serviço'}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">{(order.descricao || '').substring(0, 50)}...</p>
                  <div className="flex text-xs text-gray-500 mt-1">
                    <span>{order.cd_os}</span>
                    <span className="mx-2">•</span>
                    <span>{order.formattedTime}</span>
                  </div>
                </div>
                <ChevronRight className="text-gray-400" size={20} />
              </div>
            </div>
          ))
        )}
      </div>
      
      <OrderDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        order={selectedOrder} 
      />
    </div>
  );
};

export default DashboardPage;
