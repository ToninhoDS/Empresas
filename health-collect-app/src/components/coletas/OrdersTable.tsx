
import React, { useEffect } from 'react';

interface Order {
  id: string;
  date: string;
  sector: string;
  tech: string;
}

interface OrdersTableProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onOrderClick }) => {
  // Added debug logs to verify data is coming from tb_top_rank
  useEffect(() => {
    console.log('[OrdersTable] Received orders:', orders);
  }, [orders]);

  return (
    <div className="overflow-x-auto">
      {orders.length === 0 ? (
        <div className="text-center p-4 text-white">
          Nenhuma ordem de serviço encontrada
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-app-darker border-none">
              <th className="text-yellow-400 text-left p-2">OS</th>
              <th className="text-yellow-400 text-left p-2">DATA</th>
              <th className="text-yellow-400 text-left p-2">SETOR</th>
              <th className="text-yellow-400 text-left p-2">TÉCNICO</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr 
                key={order.id} 
                className="border-b border-gray-800 cursor-pointer hover:bg-gray-800"
                onClick={() => onOrderClick(order)}
              >
                <td className="text-yellow-400 p-2">{order.id}</td>
                <td className="text-white p-2">{order.date}</td>
                <td className="text-white p-2">{order.sector}</td>
                <td className="text-white p-2">{order.tech || 'Não atribuído'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrdersTable;
