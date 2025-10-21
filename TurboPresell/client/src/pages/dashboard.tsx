import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, Download, Plus, Bell, ChevronDown, Rocket, BarChart3, X, Edit } from "lucide-react";
import { Link } from "wouter";
import StatsCards from "@/components/stats-cards";
import CampaignTable from "@/components/campaign-table";
import CampaignForm from "@/components/campaign-form";
import UserMenu from "@/components/user-menu";
import AIChatModal from "@/components/ai-chat-modal";
import type { Campaign } from "@shared/schema";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { toast } = useToast();

  // Event listener para abrir o chat
  useEffect(() => {
    const handleOpenAIChat = () => {
      console.log('Evento openAIChat recebido');
      setIsChatOpen(true);
    };
    window.addEventListener('openAIChat', handleOpenAIChat);
    return () => window.removeEventListener('openAIChat', handleOpenAIChat);
  }, []);

  const { data: campaigns = [], isLoading, refetch } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
    refetchInterval: 5000,
  });

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.sourceUrl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && campaign.isActive) ||
                         (statusFilter === 'inactive' && !campaign.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
    toast({
      title: "Sucesso",
      description: "Campanha criada com sucesso",
    });
  };

  const handleEditSuccess = () => {
    setEditingCampaign(null);
    refetch();
    toast({
      title: "Sucesso",
      description: "Campanha atualizada com sucesso",
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
      description: "URL copiada para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro",
      description: "Falha ao copiar URL",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/20">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-4">
            {/* TurboPresell Brand */}
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
                <p className="text-sm text-gray-600 font-medium logo-subtitle-home">Clone, Customize e Converta com Velocidade!</p>
              </div>
            </Link>

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
        {/* Page Actions */}
        <div className="mb-8 flex justify-end gap-3">
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-base">
                <Plus className="h-5 w-5 mr-2" />
                Nova Presell
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-0 gap-0" style={{ maxHeight: '90vh', overflow: 'hidden' }}>
              <div className="w-full bg-gray-50 border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Rocket className="h-6 w-6 text-gray-600" />
                  Criar Nova Campanha Presell
                </h2>
                <DialogClose className="rounded-sm opacity-90 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none bg-blue-200 p-2 hover:bg-blue-300">
                  <X className="h-5 w-5 text-blue-800" />
                  <span className="sr-only">Fechar</span>
                </DialogClose>
              </div>
              <div className="px-6 py-4 pb-24 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 64px)' }}>
                <CampaignForm onSuccess={handleCreateSuccess} />
              </div>
            </DialogContent>
          </Dialog>
          
          <Link href="/ai-dashboard">
            <Button 
              variant="outline"
              className="bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-blue-200 text-blue-700 dark:from-blue-950 dark:to-cyan-950 dark:border-blue-800 dark:text-blue-300 px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <StatsCards campaigns={campaigns} />

        {/* Filters and Search */}
        {/* Enhanced Filters */}
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-md border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar campanhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-56 h-12 rounded-xl border-gray-200 focus:border-blue-500">
                <Filter className="h-5 w-5 mr-2 text-gray-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Pausado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Campaigns Table */}
        <CampaignTable
          campaigns={filteredCampaigns}
          isLoading={isLoading}
          onCopyUrl={copyToClipboard}
          onEdit={setEditingCampaign}
          onRefresh={refetch}
        />

        {/* Edit Modal */}
        <Dialog open={!!editingCampaign} onOpenChange={() => setEditingCampaign(null)}>
          <DialogContent className="max-w-3xl p-0 gap-0" style={{ maxHeight: '90vh', overflow: 'hidden' }}>
            <div className="w-full bg-gray-50 border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="h-6 w-6 text-gray-600" />
                Editar Campanha
              </h2>
              <DialogClose className="rounded-sm opacity-90 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none bg-blue-200 p-2 hover:bg-blue-300">
                <X className="h-5 w-5 text-blue-800" />
                <span className="sr-only">Fechar</span>
              </DialogClose>
            </div>
            <div className="px-6 py-4 pb-24 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 64px)' }}>
              {editingCampaign && (
                <CampaignForm
                  campaign={editingCampaign}
                  onSuccess={handleEditSuccess}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Chat Modal */}
        <AIChatModal open={isChatOpen} onOpenChange={setIsChatOpen} />
      </div>
    </div>
  );
}
