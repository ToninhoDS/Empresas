
import React, { useEffect } from 'react';
import TechnicianSelector from './TechnicianSelector';
import OrdersTable from './OrdersTable';

interface Order {
  id: string;
  date: string;
  sector: string;
  tech: string;
}

interface TechnicianFilterTabProps {
  title: string;
  technicians: { id: number; name: string; }[];
  selectedTechnician: string;
  onTechnicianSelect: (tech: string) => void;
  filteredOrders: Order[];
  onOrderClick: (order: Order) => void;
  showTechSelector?: boolean;
}

const TechnicianFilterTab: React.FC<TechnicianFilterTabProps> = ({
  title,
  technicians,
  selectedTechnician,
  onTechnicianSelect,
  filteredOrders,
  onOrderClick,
  showTechSelector = true
}) => {
  // Added debugging to check data flow
  useEffect(() => {
    console.log(`[TechnicianFilterTab] ${title} - Orders received:`, filteredOrders);
    console.log(`[TechnicianFilterTab] ${title} - Selected technician:`, selectedTechnician);
  }, [filteredOrders, selectedTechnician, title]);

  const handleTechnicianSelect = (tech: string) => {
    console.log(`[TechnicianFilterTab] Technician selected: ${tech}`);
    onTechnicianSelect(tech);
  };

  return (
    <div className="p-4">
      {showTechSelector && (
        <div className="mb-4">
          <TechnicianSelector
            technicians={technicians}
            selectedTechnician={selectedTechnician}
            onSelect={handleTechnicianSelect}
            label="Exibir ordens de:"
          />
        </div>
      )}
      <div className="bg-app-dark p-3 text-center mb-3">
        <h3 className="text-gray-300">{title}: <span className="text-yellow-400">{filteredOrders.length}</span></h3>
      </div>
      <OrdersTable orders={filteredOrders} onOrderClick={onOrderClick} />
    </div>
  );
};

export default TechnicianFilterTab;
