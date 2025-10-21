
import React from 'react';
import SearchFilters from './SearchFilters';
import OrdersTable from './OrdersTable';

interface Order {
  id: string;
  date: string;
  sector: string;
  tech: string;
}

interface SearchTabContentProps {
  technicians: { id: number; name: string; }[];
  selectedTechnician: string;
  onTechnicianSelect: (tech: string) => void;
  startDate: string;
  endDate: string;
  filteredOrders: Order[];
  onOrderClick: (order: Order) => void;
  onFilter: () => void;
  loading?: boolean;
}

const SearchTabContent: React.FC<SearchTabContentProps> = ({
  technicians,
  selectedTechnician,
  onTechnicianSelect,
  startDate,
  endDate,
  filteredOrders,
  onOrderClick,
  onFilter,
  loading = false
}) => {
  return (
    <div className="p-4">
      <SearchFilters
        technicians={technicians}
        selectedTechnician={selectedTechnician}
        onTechnicianSelect={onTechnicianSelect}
        startDate={startDate}
        endDate={endDate}
        onFilter={onFilter}
      />
      
      <div className="bg-app-dark p-3 text-center mb-3">
        <h3 className="text-gray-300">RESULTADO DA PESQUISA: <span className="text-yellow-400">{filteredOrders.length}</span></h3>
      </div>
      
      {loading ? (
        <div className="text-center p-4 text-white">Carregando...</div>
      ) : (
        <OrdersTable orders={filteredOrders} onOrderClick={onOrderClick} />
      )}
    </div>
  );
};

export default SearchTabContent;
