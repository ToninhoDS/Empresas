
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import OrderDetailModal from '@/components/OrderDetailModal';
import SearchTabContent from '@/components/coletas/SearchTabContent';
import TechnicianFilterTab from '@/components/coletas/TechnicianFilterTab';
import EmptyTabContent from '@/components/coletas/EmptyTabContent';
import { 
  getAllServiceOrders, 
  getServiceOrdersByTechnician,
  getServiceOrdersByStatus,
  getNewServiceOrders,
  ServiceOrder 
} from '@/utils/database';
import { Order, OrderDetail, convertToOrderFormat, convertToOrderDetail } from '@/types/orders';
import { useToast } from '@/hooks/use-toast';

// Lista de técnicos disponíveis
const technicians = [
  { id: 1, name: 'TODOS' },
  { id: 2, name: 'CARLOS' },
  { id: 3, name: 'AMANDA' },
  { id: 4, name: 'RAFAEL' },
  { id: 5, name: 'WESLEY' },
  { id: 6, name: 'PERES' },
  { id: 7, name: 'GARDEN' }
];

const ColetasPage: React.FC = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState('08/05/2025');
  const [endDate, setEndDate] = useState('09/05/2025');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pesquisa');
  const [selectedTechnician, setSelectedTechnician] = useState('TODOS');
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);

  // Parse URL parameters to set active tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab && ['novas', 'pendentes', 'concluidas', 'pesquisa'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  useEffect(() => {
    // Set current user as default technician for the filter when in pendentes or concluidas tabs
    if ((activeTab === 'pendentes' || activeTab === 'concluidas') && user) {
      setSelectedTechnician(user.name.toUpperCase());
    }
  }, [activeTab, user]);

  // Load initial data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  // Reload data when tab or technician filter changes
  useEffect(() => {
    console.log(`[ColetasPage] Tab or technician changed: ${activeTab}, ${selectedTechnician}`);
    loadTabData(activeTab);
  }, [activeTab, selectedTechnician]);

  // Load all service orders
  const loadData = async () => {
    try {
      setLoading(true);
      console.log('[ColetasPage] Loading all service orders...');
      const data = await getAllServiceOrders();
      console.log('[ColetasPage] Service orders loaded:', data);
      setServiceOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('[ColetasPage] Error loading service orders:', error);
      toast({
        title: "Erro ao carregar ordens de serviço",
        description: "Não foi possível carregar os dados. Tente novamente mais tarde.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  // Load data for specific tab
  const loadTabData = async (tab: string) => {
    try {
      setLoading(true);
      console.log(`[ColetasPage] Loading data for tab: ${tab}, technician: ${selectedTechnician}`);
      let data: ServiceOrder[] = [];

      switch (tab) {
        case 'novas':
          data = await getNewServiceOrders();
          console.log('[ColetasPage] New service orders:', data);
          break;
        case 'pendentes':
          data = await getServiceOrdersByStatus('Pendente', selectedTechnician);
          console.log('[ColetasPage] Pending service orders:', data);
          break;
        case 'concluidas':
          data = await getServiceOrdersByStatus('Concluída', selectedTechnician);
          console.log('[ColetasPage] Completed service orders:', data);
          break;
        case 'pesquisa':
          data = await getServiceOrdersByTechnician(selectedTechnician);
          console.log('[ColetasPage] Search results for technician:', data);
          break;
      }

      // Convert ServiceOrder to Order format for display
      const formattedOrders = data.map(convertToOrderFormat);
      console.log('[ColetasPage] Formatted orders:', formattedOrders);
      setOrders(formattedOrders);
      setLoading(false);
    } catch (error) {
      console.error(`[ColetasPage] Error loading ${activeTab} data:`, error);
      setLoading(false);
    }
  };

  // Handler for order item click
  const handleOrderClick = (order: Order) => {
    // Find the original service order data
    const serviceOrder = serviceOrders.find(so => so.cd_os === order.id);
    
    if (serviceOrder) {
      const orderDetail = convertToOrderDetail(serviceOrder);
      setSelectedOrder(orderDetail);
      setIsModalOpen(true);
    }
  };

  const handleFilterTechnician = (tech: string) => {
    console.log('[ColetasPage] Filtering by technician:', tech);
    setSelectedTechnician(tech);
  };

  const handleFilter = () => {
    console.log('[ColetasPage] Filter button clicked, reloading data...');
    loadTabData(activeTab);
  };

  return (
    <div className="pb-16">
      <div className="p-4">        
        <div className="bg-app-dark rounded-md">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full rounded-t-md bg-white grid grid-cols-4">
              <TabsTrigger value="novas" className="data-[state=active]:bg-app-blue data-[state=active]:text-white">
                Novas
              </TabsTrigger>
              <TabsTrigger value="pendentes" className="data-[state=active]:bg-app-blue data-[state=active]:text-white">
                Pendentes
              </TabsTrigger>
              <TabsTrigger value="concluidas" className="data-[state=active]:bg-app-blue data-[state=active]:text-white">
                Concluídas
              </TabsTrigger>
              <TabsTrigger value="pesquisa" className="data-[state=active]:bg-app-blue data-[state=active]:text-white">
                Pesquisa
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pesquisa">
              <SearchTabContent
                technicians={technicians}
                selectedTechnician={selectedTechnician}
                onTechnicianSelect={handleFilterTechnician}
                startDate={startDate}
                endDate={endDate}
                filteredOrders={orders}
                onOrderClick={handleOrderClick}
                onFilter={handleFilter}
                loading={loading}
              />
            </TabsContent>
            
            <TabsContent value="novas">
              {loading ? (
                <div className="p-4 text-center text-white">Carregando...</div>
              ) : orders.length === 0 ? (
                <EmptyTabContent message="Não existem novas ordens de serviço no momento" />
              ) : (
                <div className="p-4">
                  <div className="bg-app-dark p-3 text-center mb-3">
                    <h3 className="text-gray-300">NOVAS ORDENS: <span className="text-yellow-400">{orders.length}</span></h3>
                  </div>
                  <TechnicianFilterTab
                    title="NOVAS ORDENS"
                    technicians={[]}
                    selectedTechnician={''}
                    onTechnicianSelect={() => {}}
                    filteredOrders={orders}
                    onOrderClick={handleOrderClick}
                    showTechSelector={false}
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pendentes">
              {loading ? (
                <div className="p-4 text-center text-white">Carregando...</div>
              ) : (
                <TechnicianFilterTab
                  title="ORDENS PENDENTES"
                  technicians={technicians}
                  selectedTechnician={selectedTechnician}
                  onTechnicianSelect={handleFilterTechnician}
                  filteredOrders={orders}
                  onOrderClick={handleOrderClick}
                />
              )}
            </TabsContent>
            
            <TabsContent value="concluidas">
              {loading ? (
                <div className="p-4 text-center text-white">Carregando...</div>
              ) : (
                <TechnicianFilterTab
                  title="ORDENS CONCLUÍDAS"
                  technicians={technicians}
                  selectedTechnician={selectedTechnician}
                  onTechnicianSelect={handleFilterTechnician}
                  filteredOrders={orders}
                  onOrderClick={handleOrderClick}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <OrderDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        order={selectedOrder} 
      />
    </div>
  );
};

export default ColetasPage;
