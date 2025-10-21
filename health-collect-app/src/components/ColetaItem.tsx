
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ColetaItemProps {
  id: string;
  paciente: string;
  descricao: string;
  hora: string;
  status: 'nova' | 'pendente' | 'concluida';
  onClick?: () => void;
}

const ColetaItem: React.FC<ColetaItemProps> = ({ 
  id, 
  paciente, 
  descricao, 
  hora, 
  status,
  onClick 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'nova': return 'text-app-blue';
      case 'pendente': return 'text-app-orange';
      case 'concluida': return 'text-app-green';
      default: return 'text-gray-500';
    }
  };

  return (
    <div 
      className="app-card mb-3 flex items-center justify-between cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1">
        <h3 className={`font-medium text-lg ${getStatusColor()}`}>{paciente}</h3>
        <p className="text-gray-300 text-sm line-clamp-2">{descricao}</p>
        <div className="flex items-center text-xs text-gray-400 mt-1">
          <span>{id}</span>
          <span className="mx-2">•</span>
          <span>{hora}</span>
        </div>
      </div>
      <ChevronRight className="text-gray-400" size={20} />
    </div>
  );
};

export default ColetaItem;
