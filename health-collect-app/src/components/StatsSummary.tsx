
import React from 'react';
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

const data = [
  { hour: '00h', PERES: 2, AMANDA: 1.5, CARLOS: 0 },
  { hour: '04h', PERES: 1, AMANDA: 2.5, CARLOS: 1.2 },
  { hour: '08h', PERES: 3.5, AMANDA: 2, CARLOS: 2.5 },
  { hour: '12h', PERES: 0.5, AMANDA: 3.5, CARLOS: 0 },
  { hour: '16h', PERES: 2, AMANDA: 1, CARLOS: 0 },
  { hour: '20h', PERES: 2.2, AMANDA: 1.5, CARLOS: 0.9 },
  { hour: '23h', PERES: 2, AMANDA: 2, CARLOS: 0 },
];

const technicians = [
  { name: 'PERES', percentage: 43, color: '#f59e0b' },
  { name: 'AMANDA', percentage: 30, color: '#8b5cf6' },
  { name: 'CARLOS', percentage: 9, color: '#ec4899' },
  { name: 'RAFAEL', percentage: 9, color: '#ef4444' },
  { name: 'WESLEY', percentage: 7, color: '#3b82f6' },
  { name: 'GARDEN', percentage: 2, color: '#10b981' },
];

const StatsSummary: React.FC = () => {
  const today = new Date().toLocaleDateString('pt-BR');
  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="w-full p-4">
      <Card className="p-4 bg-app-dark text-white border-none">
        <h2 className="text-2xl font-bold mb-1">Rank do Dia</h2>
        <p className="text-gray-400 mb-4">{today}, {time}</p>
        
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.375rem' }} />
              <Line type="monotone" dataKey="PERES" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="AMANDA" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="CARLOS" stroke="#ec4899" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-2 my-4">
          {technicians.map((tech) => (
            <div
              key={tech.name}
              className="px-4 py-1 rounded-md"
              style={{ backgroundColor: tech.color, opacity: 0.9 }}
            >
              {tech.name}
            </div>
          ))}
        </div>

        {technicians.map((tech) => (
          <div key={tech.name} className="mb-3">
            <div className="flex justify-between mb-1">
              <span>{tech.name}</span>
              <span>{tech.percentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${tech.percentage}%`,
                  backgroundColor: tech.color,
                }}
              ></div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default StatsSummary;
