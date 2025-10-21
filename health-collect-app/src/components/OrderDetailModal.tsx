
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Phone } from 'lucide-react';
import { OrderDetail } from '@/types/orders';

interface OrderDetailProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetail | null;
}

const OrderDetailModal: React.FC<OrderDetailProps> = ({ isOpen, onClose, order }) => {
  if (!order) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="bg-app-dark text-white border-gray-700 max-w-md mx-auto">
        <DialogHeader>
          <div className="flex justify-between items-center mb-2">
            <DialogTitle className="text-xl font-bold">Detalhes da OS</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <div className="text-gray-400 text-sm">OS:</div>
              <div className="text-yellow-400 font-bold">{order.id}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Hora:</div>
              <div className="text-yellow-400 font-bold">{order.time}</div>
            </div>
          </div>
          
          <div>
            <div className="text-gray-400 text-sm">Setor Solicitante:</div>
            <div className="text-white font-bold">{order.sector}</div>
          </div>
          
          <div>
            <div className="text-gray-400 text-sm">Serviço Solicitado:</div>
            <div className="text-white font-bold">{order.title}</div>
          </div>
          
          <div>
            <div className="text-gray-400 text-sm">Descrição:</div>
            <div className="bg-app-darker p-3 rounded-md mt-1">{order.description}</div>
          </div>
          
          <div>
            <div className="text-gray-400 text-sm">Solicitante:</div>
            <div className="text-white font-bold">{order.requester}</div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <div className="text-gray-400 text-sm">Status:</div>
              <div className="text-white font-bold">{order.status}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Prioridade:</div>
              <div className="text-white font-bold">{order.priority}</div>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" className="w-1/3 bg-white text-black">
              Cancelar
            </Button>
            <Button className="w-2/3 bg-app-green ml-2">
              <Phone className="mr-2" size={18} /> Contatar Solicitante
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;
