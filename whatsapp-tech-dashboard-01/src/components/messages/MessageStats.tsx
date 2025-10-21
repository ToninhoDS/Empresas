
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  generateDailyMessageStats, 
  generateWeeklyMessageStats, 
  generateMonthlyMessageStats, 
  generateYearlyMessageStats 
} from '@/utils/mockData';

const MessageStats: React.FC = () => {
  const [activeTab, setActiveTab] = useState('daily');
  
  const dailyData = generateDailyMessageStats();
  const weeklyData = generateWeeklyMessageStats();
  const monthlyData = generateMonthlyMessageStats();
  const yearlyData = generateYearlyMessageStats();
  
  const getTotalMessages = () => {
    switch (activeTab) {
      case 'daily':
        return dailyData.reduce((sum, item) => sum + item.count, 0);
      case 'weekly':
        return weeklyData.reduce((sum, item) => sum + item.count, 0);
      case 'monthly':
        return monthlyData.reduce((sum, item) => sum + item.count, 0);
      case 'yearly':
        return yearlyData.reduce((sum, item) => sum + item.count, 0);
      default:
        return 0;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas de Mensagens</CardTitle>
        <CardDescription>Visualize o volume de mensagens por período</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">Diário</TabsTrigger>
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
            <TabsTrigger value="yearly">Anual</TabsTrigger>
          </TabsList>
          
          <div className="mt-6 bg-whatsapp-light/10 p-4 rounded-md mb-6">
            <div className="text-sm text-gray-500">Total de mensagens</div>
            <div className="text-3xl font-bold">{getTotalMessages()}</div>
          </div>
          
          <TabsContent value="daily" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#128C7E" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="weekly" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#128C7E" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="monthly" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#128C7E" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="yearly" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#128C7E" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MessageStats;
