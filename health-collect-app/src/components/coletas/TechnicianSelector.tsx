
import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Technician {
  id: number;
  name: string;
}

interface TechnicianSelectorProps {
  technicians: Technician[];
  selectedTechnician: string;
  onSelect: (tech: string) => void;
  label?: string;
}

const TechnicianSelector: React.FC<TechnicianSelectorProps> = ({ 
  technicians, 
  selectedTechnician, 
  onSelect,
  label = "Filtrar por Técnico:" 
}) => {
  return (
    <div>
      <label className="block text-sm mb-1 text-gray-300">{label}</label>
      <Select value={selectedTechnician} onValueChange={onSelect}>
        <SelectTrigger className="bg-app-darker text-white border-gray-700">
          <SelectValue placeholder="Selecione um técnico" />
        </SelectTrigger>
        <SelectContent className="bg-app-darker border-gray-700">
          <SelectGroup>
            {technicians.map((tech) => (
              <SelectItem key={tech.id} value={tech.name} className="text-white hover:bg-app-blue">
                {tech.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TechnicianSelector;
