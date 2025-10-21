import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Rocket, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Campaign } from '@shared/schema';
import StatsCards from '@/components/stats-cards';
import PerformanceChart from '@/components/performance-chart';
import PerformanceTable from '@/components/performance-table';
import UserMenu from '@/components/user-menu';
import AIChatModal from '@/components/ai-chat-modal';

export default function AIDashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Event listener para abrir o chat
  useEffect(() => {
    const handleOpenAIChat = () => {
      console.log('Evento openAIChat recebido na página AI Dashboard');
      setIsChatOpen(true);
    };
    window.addEventListener('openAIChat', handleOpenAIChat);
    return () => window.removeEventListener('openAIChat', handleOpenAIChat);
  }, []);
  
  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
    refetchInterval: 5000,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/20">
      {/* Navbar idêntica à Home */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-4">
            {/* Lado esquerdo: Botão voltar + TurboPresell Brand */}
            <Link href="/" className="flex items-center space-x-4 cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg logo-glow">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent logo-glow">
                  TurboPresell
                </h1>
                <p className="text-sm text-gray-600 font-medium logo-subtitle-dashboard">Clone, Customize e Converta com Velocidade!</p>
              </div>
            </Link>

            {/* Título centralizado com estilo melhorado */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent tracking-tight dashboard-title">
                Dashboard
              </h2>
            </div>

            {/* User Profile Menu */}
            <div className="flex items-center space-x-4">
              <UserMenu 
                userName="John Doe"
                userRole="Administrador"
                userInitials="JD"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Botão Falar com IA na mesma posição do Nova Presell */}
        <div className="mb-8 flex justify-end">
          <Button 
            onClick={() => setIsChatOpen(true)}
            variant="outline"
            className="bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200 text-purple-700 dark:from-purple-950 dark:to-blue-950 dark:border-purple-800 dark:text-purple-300 px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Falar com IA
          </Button>
          <Button 
            onClick={() => window.location.href='http://localhost:5000/'}
            className="ml-4 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background hover:bg-accent hover:text-accent-foreground h-10 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-blue-200 text-blue-700 dark:from-blue-950 dark:to-cyan-950 dark:border-blue-800 dark:text-blue-300 px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-5 w-5"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </Button>
        </div>

        {/* Stats Cards */}
        <StatsCards campaigns={campaigns} />
        
        {/* Performance Chart */}
        <div className="mt-8">
          <PerformanceChart />
        </div>
        
        {/* Performance Table */}
        <div className="mt-8">
          <PerformanceTable />
        </div>
      </div>

      {/* AI Chat Modal */}
      {isChatOpen && <AIChatModal open={isChatOpen} onOpenChange={setIsChatOpen}></AIChatModal>}
    </div>
  );
}