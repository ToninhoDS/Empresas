
import React from 'react';
import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { rankColors, masterTableData } from '@/data/technicianStats';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MasterChartTab: React.FC = () => {
  const today = new Date().toLocaleDateString('pt-BR');
  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Transformando os dados para o formato esperado pelo gráfico de barras
  const chartData = masterTableData.map((item) => ({
    name: item.name,
    value: item.count
  }));

  return (
    <div className="w-full">
      <Card className="p-4 bg-app-dark text-white border-none">
        <h2 className="text-2xl font-bold mb-1">Ranking Geral</h2>
        <p className="text-gray-400 mb-4">{today}, {time}</p>
        
        <div className="h-[250px] w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#9ca3af" 
                tick={{ fill: "#ffffff" }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '0.375rem' 
                }} 
              />
              <Bar 
                dataKey="value" 
                barSize={30}
                label={{ 
                  position: 'insideLeft', 
                  fill: '#fff',
                  fontSize: 12
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={rankColors[(index + 1) as keyof typeof rankColors]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-app-darker border-b border-gray-700">
              <TableHead className="text-center text-white">NOME</TableHead>
              <TableHead className="text-center text-white">OS ATENDIDAS</TableHead>
              <TableHead className="text-center text-white">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {masterTableData.map((tech, index) => (
              <TableRow key={tech.name} className="border-b border-gray-700">
                <TableCell className="text-center">{tech.name}</TableCell>
                <TableCell className="text-center">{tech.count}</TableCell>
                <TableCell className="text-center">{tech.percentage}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default MasterChartTab;
