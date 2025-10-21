
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown, Clock } from 'lucide-react';
import TechnicianSelector from './TechnicianSelector';

interface SearchFiltersProps {
  technicians: { id: number; name: string; }[];
  selectedTechnician: string;
  onTechnicianSelect: (tech: string) => void;
  startDate: string;
  endDate: string;
  onFilter: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  technicians,
  selectedTechnician,
  onTechnicianSelect,
  startDate,
  endDate,
  onFilter
}) => {
  // Added console log to track when filter button is clicked
  const handleFilterClick = () => {
    console.log('Filter button clicked');
    console.log('Current filter values:', { selectedTechnician, startDate, endDate });
    onFilter();
  };

  return (
    <div className="grid grid-cols-1 gap-3 mb-3">
      <TechnicianSelector 
        technicians={technicians} 
        selectedTechnician={selectedTechnician} 
        onSelect={onTechnicianSelect}
      />
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1 text-gray-300">Tipo de Serviço:</label>
          <div className="relative">
            <div className="bg-app-darker text-yellow-400 border border-gray-700 p-2 rounded flex justify-between items-center">
              <span>TODOS</span>
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-300">Data de Início:</label>
          <div className="relative">
            <div className="bg-app-darker text-yellow-400 border border-gray-700 p-2 rounded flex justify-between items-center">
              <span>{startDate}</span>
              <Calendar size={16} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1 text-gray-300">Data de Fim:</label>
          <div className="relative">
            <div className="bg-app-darker text-yellow-400 border border-gray-700 p-2 rounded flex justify-between items-center">
              <span>{endDate}</span>
              <Calendar size={16} />
            </div>
          </div>
        </div>
        <div className="flex items-end">
          <Button 
            className="bg-yellow-500 hover:bg-yellow-600 text-black w-full" 
            onClick={handleFilterClick}
          >
            Filtrar
          </Button>
        </div>
      </div>
      
      <div className="text-xs text-gray-300 flex items-center mt-2">
        <Clock size={14} className="mr-1" /> 
        {new Date().toLocaleTimeString()} - {new Date().toLocaleDateString('pt-BR')}
      </div>
    </div>
  );
};

export default SearchFilters;
