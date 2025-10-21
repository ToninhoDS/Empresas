import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye, Edit, Download, Trash2, Globe, Camera, BarChart3, RefreshCw, Loader2, CheckCircle, PauseCircle, Clock, XCircle, Info, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Campaign } from "@shared/schema";

interface CampaignTableProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onCopyUrl: (url: string) => void;
  onEdit: (campaign: Campaign) => void;
  onRefresh: () => void;
}

type SortField = 'name' | 'cloningStatus' | 'createdAt' | null;
type SortDirection = 'asc' | 'desc';

export default function CampaignTable({ campaigns, isLoading, onCopyUrl, onEdit, onRefresh }: CampaignTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<Campaign | null>(null);
  const [detailsCampaign, setDetailsCampaign] = useState<Campaign | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<number>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState<boolean>(false);
  const [viewsResetSuccess, setViewsResetSuccess] = useState<boolean>(false);
  const [clicksResetSuccess, setClicksResetSuccess] = useState<boolean>(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/campaigns/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Presell excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao excluir presell.",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map(id => apiRequest("DELETE", `/api/campaigns/${id}`)));
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: `${selectedCampaigns.size} presells excluídas com sucesso.`,
      });
      setSelectedCampaigns(new Set());
      setBulkDeleteConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao excluir presells.",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PUT", `/api/campaigns/${id}`, { isActive });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Status da presell atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar status da presell.",
        variant: "destructive",
      });
    },
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1 text-gray-600" />
      : <ArrowDown className="h-4 w-4 ml-1 text-gray-600" />;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCampaigns(new Set(campaigns.map(c => c.id)));
    } else {
      setSelectedCampaigns(new Set());
    }
  };

  const handleSelectCampaign = (campaignId: number, checked: boolean) => {
    const newSelected = new Set(selectedCampaigns);
    if (checked) {
      newSelected.add(campaignId);
    } else {
      newSelected.delete(campaignId);
    }
    setSelectedCampaigns(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedCampaigns.size === 0) return;
    setBulkDeleteConfirm(true);
  };

  const isAllSelected = campaigns.length > 0 && selectedCampaigns.size === campaigns.length;
  const isIndeterminate = selectedCampaigns.size > 0 && selectedCampaigns.size < campaigns.length;

  // Carrega configurações do banco de dados para verificar proteção de exclusão em massa
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const bulkDeleteProtectionEnabled = settings?.bulkDeleteProtection || false;
  
  // Limpa os estados de sucesso quando a modal é fechada
  useEffect(() => {
    if (!detailsCampaign) {
      setViewsResetSuccess(false);
      setClicksResetSuccess(false);
    }
  }, [detailsCampaign]);

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'cloningStatus':
        aValue = a.cloningStatus;
        bValue = b.cloningStatus;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const reprocessMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/campaigns/${id}/reprocess`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      toast({
        title: "Sucesso",
        description: "Reprocessamento da campanha iniciado",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao iniciar o reprocessamento",
        variant: "destructive",
      });
    },
  });

  const resetViewsMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/campaigns/${id}/reset-views`);
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Visualizações foram redefinidas." });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      
      // Atualiza o valor de views diretamente no objeto detailsCampaign
      if (detailsCampaign) {
        setDetailsCampaign({
          ...detailsCampaign,
          views: 0
        });
      }
      
      // Exibe o feedback visual
      setViewsResetSuccess(true);
      // Esconde o feedback após 3 segundos
      setTimeout(() => setViewsResetSuccess(false), 3000);
      // Não fecha a modal para permitir que o usuário veja o resultado
      // setDetailsCampaign(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao redefinir visualizações.",
        variant: "destructive",
      });
    },
  });

  const resetClicksMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/campaigns/${id}/reset-clicks`);
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Cliques foram redefinidos." });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      
      // Atualiza o valor de clicks diretamente no objeto detailsCampaign
      if (detailsCampaign) {
        setDetailsCampaign({
          ...detailsCampaign,
          clicks: 0
        });
      }
      
      // Exibe o feedback visual
      setClicksResetSuccess(true);
      // Esconde o feedback após 3 segundos
      setTimeout(() => setClicksResetSuccess(false), 3000);
      // Não fecha a modal para permitir que o usuário veja o resultado
      // setDetailsCampaign(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao redefinir cliques.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (campaign: Campaign) => {
    // Se está pausado, mostrar pausado independente do status de clonagem
    if (!campaign.isActive) {
      return (
        <Badge variant="secondary" className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300">
          <PauseCircle className="h-3 w-3 mr-1" />
          Pausado
        </Badge>
      );
    }

    // Se está ativo, mostrar o status de clonagem
    switch (campaign.cloningStatus) {
      case 'success':
        return (
          <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'screenshot-mode':
        return (
          <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
            <XCircle className="h-3 w-3 mr-1" />
            Erro
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Processando
          </Badge>
        );
    }
  };

  const getCampaignIcon = () => <Camera className="h-4 w-4 text-amber-600" />;

  const getPresellUrl = (shortUrl: string) => {
    return `${window.location.origin}/p/${shortUrl}`;
  };

  const truncateUrl = (url: string, maxLength: number = 25) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  // Função para pegar a largura mais próxima
  const getClosestWidth = (widths: number[], w: number) => {
    let closest = widths[0];
    let minDiff = Math.abs(w - closest);
    for (let i = 1; i < widths.length; i++) {
      const diff = Math.abs(w - widths[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closest = widths[i];
      }
    }
    return closest;
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando campanhas...</p>
        </div>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="p-8 text-center">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha encontrada</h3>
          <p className="text-gray-600">Crie sua primeira campanha de presell para começar.</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-lg rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <TableHead className="w-20">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={selectedCampaigns.size === 0 || bulkDeleteMutation.isPending || bulkDeleteProtectionEnabled}
                    className="h-7 w-7 p-0 hover:bg-red-50 text-red-600 hover:text-red-800 disabled:opacity-50"
                    title={bulkDeleteProtectionEnabled ? "Exclusão em massa desabilitada nas configurações" : "Excluir Selecionadas"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-blue-50 select-none transition-colors font-semibold text-gray-700"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Campanha
                  {getSortIcon('name')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">URL Gerada</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-blue-50 select-none transition-colors font-semibold text-gray-700"
                onClick={() => handleSort('cloningStatus')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('cloningStatus')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-blue-50 select-none transition-colors font-semibold text-gray-700"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  Data de Criação
                  {getSortIcon('createdAt')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCampaigns.map((campaign) => {
              const isPending = campaign.cloningStatus === 'pending';
              const isSelected = selectedCampaigns.has(campaign.id);
              return (
                <TableRow key={campaign.id} className={`hover:bg-blue-50/30 transition-colors border-b border-gray-100 ${isSelected ? 'bg-blue-50/20' : ''}`}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectCampaign(campaign.id, !!checked)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center transition-colors ${!isPending ? 'hover:bg-amber-200 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                        onClick={() => {
                          if (!isPending) window.open(`/p/${campaign.shortUrl}`, '_blank');
                        }}
                        title={!isPending ? 'Visualizar' : undefined}
                        style={{ pointerEvents: isPending ? 'none' : 'auto' }}
                      >
                        <Camera className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="ml-4">
                        <div
                          className={`text-sm font-medium text-gray-900 transition-colors ${!isPending ? 'hover:text-primary-600 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                          onClick={() => {
                            if (!isPending) onCopyUrl(getPresellUrl(campaign.shortUrl));
                          }}
                          title={!isPending ? 'Copiar o link' : undefined}
                          style={{ pointerEvents: isPending ? 'none' : 'auto' }}
                        >
                          {campaign.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {campaign.description || "Sem descrição"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={`text-sm text-gray-900 transition-colors ${!isPending ? 'hover:text-primary-600 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                      onClick={() => {
                        if (!isPending) onCopyUrl(getPresellUrl(campaign.shortUrl));
                      }}
                      title={!isPending ? 'Copiar o link' : undefined}
                      style={{ pointerEvents: isPending ? 'none' : 'auto' }}
                    >
                      {truncateUrl(getPresellUrl(campaign.shortUrl))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(campaign)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {format(new Date(campaign.createdAt), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 flex-wrap justify-start">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatusMutation.mutate({ id: campaign.id, isActive: !campaign.isActive })}
                        title={campaign.isActive ? "Pausar Presell" : "Ativar Presell"}
                        disabled={isPending || toggleStatusMutation.isPending}
                        className={`rounded-lg transition-all duration-200 hover:scale-105 ${campaign.isActive ? "text-red-600 hover:text-red-800 hover:bg-red-50" : "text-green-600 hover:text-green-800 hover:bg-green-50"}`}
                      >
                        {campaign.isActive ? <PauseCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(campaign)}
                        title="Editar"
                        disabled={isPending}
                        className="rounded-lg transition-all duration-200 hover:scale-105 hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailsCampaign(campaign)}
                        title="Detalhes"
                        disabled={isPending}
                        className="rounded-lg transition-all duration-200 hover:scale-105 hover:bg-purple-50 text-purple-600 hover:text-purple-800"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (campaign.screenshotPaths) {
                            const paths = typeof campaign.screenshotPaths === 'string' ? JSON.parse(campaign.screenshotPaths) : campaign.screenshotPaths;
                            const widths = Object.keys(paths).map(Number);
                            const w = window.innerWidth;
                            const closest = getClosestWidth(widths, w);
                            window.open(`/api/campaigns/${campaign.id}/screenshot/${closest}`, '_blank');
                          } else {
                            toast({
                              title: "Não Disponível",
                              description: "Nenhuma captura de tela disponível para download",
                              variant: "destructive",
                            });
                          }
                        }}
                        title="Baixar Captura de Tela"
                        disabled={isPending}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {campaign.cloningStatus === 'failed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => reprocessMutation.mutate(campaign.id)}
                          disabled={reprocessMutation.isPending || isPending}
                          title="Tentar Novamente"
                        >
                          <RefreshCw className={`h-4 w-4 ${reprocessMutation.isPending ? 'animate-spin' : ''}`} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(campaign)}
                        title="Excluir"
                        className="rounded-lg transition-all duration-200 hover:scale-105 text-red-600 hover:text-red-800 hover:bg-red-50"
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!deleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o Presell: "{deleteConfirm?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  deleteMutation.mutate(deleteConfirm.id);
                  setDeleteConfirm(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Confirmar Exclusão'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de detalhes da campanha */}
      {detailsCampaign && (
        <AlertDialog 
          open={!!detailsCampaign} 
          onOpenChange={(open) => {
            if (!open) {
              setDetailsCampaign(null);
              setViewsResetSuccess(false);
              setClicksResetSuccess(false);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Detalhes da Campanha</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium text-gray-700">Nome:</span>
                      <span className="text-gray-900">{detailsCampaign.name}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium text-gray-700">Status:</span>
                      {getStatusBadge(detailsCampaign)}
                    </div>

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium text-gray-700">Modelo de Clonagem:</span>
                      <span className="text-gray-900">
                        {detailsCampaign.cloningMode === 'automatic' ? 'Automático' : 
                         detailsCampaign.cloningMode === 'clone_only' ? 'Apenas Clone' : 
                         'Apenas Screenshot'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-start py-2 border-b">
                      <span className="font-medium text-gray-700">Descrição:</span>
                      <span className="text-gray-900 text-right max-w-xs">{detailsCampaign.description || 'Sem descrição'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium text-gray-700">Data de Criação:</span>
                      <span className="text-gray-900">{format(new Date(detailsCampaign.createdAt), 'dd/MM/yyyy')}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{detailsCampaign.views}</div>
                        <div className="text-sm text-blue-600 font-medium">Visualizações</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{detailsCampaign.clicks}</div>
                        <div className="text-sm text-green-600 font-medium">Cliques</div>
                      </div>
                    </div>

                    {detailsCampaign.cloningStatus === 'failed' && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-red-800 font-medium">Erro de Processamento:</div>
                        <div className="text-red-600 text-sm mt-1">Falha ao capturar screenshots. Possível bloqueio ou direitos autorais.</div>
                      </div>
                    )}
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-between items-center">
              <div className="flex gap-2">
                 <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetViewsMutation.mutate(detailsCampaign.id);
                    }}
                    disabled={resetViewsMutation.isPending}
                  >
                    {resetViewsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span className="ml-2">Zerar Views</span>
                  </Button>
                  {viewsResetSuccess && (
                    <div className="absolute top-0 left-0 right-0 -mt-8 text-center">
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200 inline-flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> Views zeradas com sucesso
                      </span>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetClicksMutation.mutate(detailsCampaign.id);
                    }}
                    disabled={resetClicksMutation.isPending}
                  >
                    {resetClicksMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span className="ml-2">Zerar Cliques</span>
                  </Button>
                  {clicksResetSuccess && (
                    <div className="absolute top-0 left-0 right-0 -mt-8 text-center">
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200 inline-flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> Cliques zerados com sucesso
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <AlertDialogCancel onClick={() => {
                setDetailsCampaign(null);
                // Limpa os estados de sucesso ao fechar a modal
                setViewsResetSuccess(false);
                setClicksResetSuccess(false);
              }}>Fechar</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Modal de confirmação de exclusão em massa */}
      <AlertDialog open={bulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão de Campanhas</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div>
                  Você tem certeza que deseja excluir <span className="font-semibold">{selectedCampaigns.size}</span> campanhas selecionadas?
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-800 text-sm font-medium">
                    ⚠️ Esta ação não poderá ser desfeita.
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkDeleteConfirm(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                bulkDeleteMutation.mutate(Array.from(selectedCampaigns));
                setBulkDeleteConfirm(false);
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
