
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LineChartTab from '@/components/stats/LineChartTab';
import MasterChartTab from '@/components/stats/MasterChartTab';
import { 
  dayData, weekData, monthData, yearData, 
  dayTableData, weekTableData, monthTableData, yearTableData
} from '@/data/technicianStats';

const StatsPage: React.FC = () => {
  return (
    <div className="p-4">
      <Tabs defaultValue="day" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4 bg-app-darker">
          <TabsTrigger 
            value="day" 
            className="data-[state=active]:bg-white data-[state=active]:text-app-dark"
          >
            Dia
          </TabsTrigger>
          <TabsTrigger 
            value="week" 
            className="data-[state=active]:bg-white data-[state=active]:text-app-dark"
          >
            Semana
          </TabsTrigger>
          <TabsTrigger 
            value="month" 
            className="data-[state=active]:bg-white data-[state=active]:text-app-dark"
          >
            Mês
          </TabsTrigger>
          <TabsTrigger 
            value="year" 
            className="data-[state=active]:bg-white data-[state=active]:text-app-dark"
          >
            Ano
          </TabsTrigger>
          <TabsTrigger 
            value="master" 
            className="data-[state=active]:bg-white data-[state=active]:text-app-dark"
          >
            Mestre
          </TabsTrigger>
        </TabsList>

        <TabsContent value="day">
          <LineChartTab 
            title="Rank do Dia" 
            data={dayData} 
            xAxisKey="hour"
            technicians={dayTableData}
          />
        </TabsContent>

        <TabsContent value="week">
          <LineChartTab 
            title="Rank da Semana" 
            data={weekData} 
            xAxisKey="day"
            technicians={weekTableData}
          />
        </TabsContent>

        <TabsContent value="month">
          <LineChartTab 
            title="Rank do Mês" 
            data={monthData} 
            xAxisKey="week"
            technicians={monthTableData}
          />
        </TabsContent>

        <TabsContent value="year">
          <LineChartTab 
            title="Rank do Ano" 
            data={yearData} 
            xAxisKey="quarter"
            technicians={yearTableData}
          />
        </TabsContent>

        <TabsContent value="master">
          <MasterChartTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsPage;
