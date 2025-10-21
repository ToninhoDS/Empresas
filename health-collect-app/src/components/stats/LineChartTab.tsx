
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Button } from "@/components/ui/button";
import { techColors } from '@/data/technicianStats';
import { Eye, EyeOff } from 'lucide-react';
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface LineChartTabProps {
  title: string;
  data: any[];
  xAxisKey: string;
  technicians: { name: string; count: number; percentage: number }[];
}

const LineChartTab: React.FC<LineChartTabProps> = ({ title, data, xAxisKey, technicians }) => {
  const today = new Date().toLocaleDateString('pt-BR');
  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  // Sort technicians by percentage (highest first)
  const sortedTechnicians = [...technicians].sort((a, b) => b.percentage - a.percentage);
  
  // Get top 4 technicians and the rest
  const topTechnicians = sortedTechnicians.slice(0, 4);
  const restTechnicians = sortedTechnicians.slice(4);
  
  // State to track which technicians are visible
  const [visibleTechs, setVisibleTechs] = useState<string[]>(
    topTechnicians.map(tech => tech.name)
  );
  
  // Toggle showing all technicians or just top 4
  const [showAllTechs, setShowAllTechs] = useState(false);
  
  const toggleTechnician = (techName: string) => {
    if (visibleTechs.includes(techName)) {
      setVisibleTechs(visibleTechs.filter(t => t !== techName));
    } else {
      setVisibleTechs([...visibleTechs, techName]);
    }
  };
  
  const toggleAllTechs = () => {
    setShowAllTechs(!showAllTechs);
    if (!showAllTechs) {
      // Show all top 7 (or less if there are fewer technicians)
      setVisibleTechs(sortedTechnicians.slice(0, 7).map(tech => tech.name));
    } else {
      // Show only top 4
      setVisibleTechs(topTechnicians.map(tech => tech.name));
    }
  };

  // Get technicians to display (limited to top 7)
  const displayTechnicians = sortedTechnicians.slice(0, 7);

  return (
    <div className="w-full">
      <Card className="p-4 bg-app-dark text-white border-none">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">{title}</h2>
            <p className="text-gray-400">{today}, {time}</p>
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={toggleAllTechs}
            className="text-xs flex items-center gap-1 bg-app-darker border-gray-700 hover:bg-app-blue"
          >
            {showAllTechs ? <EyeOff size={14} /> : <Eye size={14} />}
            {showAllTechs ? "Mostrar Top 4" : "Mostrar Todos"}
          </Button>
        </div>
        
        <div className="h-[200px] w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={xAxisKey} stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.375rem' }} />
              {Object.keys(techColors)
                .filter(tech => visibleTechs.includes(tech))
                .map((tech) => (
                  <Line 
                    key={tech} 
                    type="monotone" 
                    dataKey={tech} 
                    stroke={techColors[tech as keyof typeof techColors]} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-2 my-4">
          {displayTechnicians.map((tech) => (
            <button
              key={tech.name}
              onClick={() => toggleTechnician(tech.name)}
              className={`px-4 py-1 rounded-md transition-all ${
                visibleTechs.includes(tech.name) 
                  ? `opacity-100`
                  : 'opacity-40'
              }`}
              style={{ 
                backgroundColor: techColors[tech.name as keyof typeof techColors]
              }}
            >
              {tech.name}
            </button>
          ))}
        </div>

        {sortedTechnicians.map((tech) => (
          <div key={tech.name} className="mb-3">
            <div className="flex justify-between mb-1">
              <span>{tech.name}</span>
              <div className="flex space-x-4">
                <span className="text-gray-400">{tech.count} OS</span>
                <span>{tech.percentage}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${tech.percentage}%`,
                  backgroundColor: techColors[tech.name as keyof typeof techColors],
                }}
              ></div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default LineChartTab;
