import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Calendar, TrendingUp, Eye, MousePointer, ChevronDown, Settings } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Campaign {
  id: number;
  name: string;
  views: number;
  clicks: number;
  createdAt: string;
}

type TimeFilter = 'day' | 'week' | 'month' | 'year';
type MetricType = 'views' | 'clicks';

// Fetch real analytics data from the database
const fetchAnalyticsData = async (campaignIds: number[], timeFilter: TimeFilter, metric: MetricType) => {
  if (!campaignIds || campaignIds.length === 0) {
    return [];
  }

  const now = new Date();
  let startDate: Date;
  let groupBy: 'hour' | 'day' | 'week' | 'month';
  
  switch (timeFilter) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
      groupBy = 'hour';
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
      groupBy = 'day';
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
      groupBy = 'day';
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // Last 365 days
      groupBy = 'month';
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = 'day';
  }

  try {
    const response = await fetch('/api/analytics/multi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ids: campaignIds,
        start: startDate.toISOString(),
        grouping: groupBy
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // console.log('Real analytics chart data:', data);
    
    // Transform data for chart
    const chartMap = new Map<string, any>();
    
    data.forEach((campaignData: any) => {
      const metricData = metric === 'views' ? campaignData.views : campaignData.clicks;
      
      metricData.forEach((point: any) => {
        const period = point.period;
        const displayName = formatPeriodLabel(period, timeFilter);
        
        if (!chartMap.has(period)) {
          chartMap.set(period, {
            name: displayName,
            period: period
          });
        }
        
        const chartPoint = chartMap.get(period);
        chartPoint[`campaign_${campaignData.campaignId}`] = point.count;
      });
    });
    
    return Array.from(chartMap.values()).sort((a, b) => 
      new Date(a.period).getTime() - new Date(b.period).getTime()
    );
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return [];
  }
};

// Format period labels for display
const formatPeriodLabel = (period: string, timeFilter: TimeFilter): string => {
  switch (timeFilter) {
    case 'day':
      // Format: "2025-06-22 14:00:00" -> "14:00"
      return period.split(' ')[1]?.substring(0, 5) || period;
    case 'week':
    case 'month':
      // Format: "2025-06-22" -> "22/06"
      const dateParts = period.split('-');
      if (dateParts.length === 3) {
        return `${dateParts[2]}/${dateParts[1]}`;
      }
      return period;
    case 'year':
      // Format: "2025-06" -> "Jun"
      const monthParts = period.split('-');
      if (monthParts.length === 2) {
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return monthNames[parseInt(monthParts[1]) - 1] || period;
      }
      return period;
    default:
      return period;
  }
};

const colors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export default function PerformanceChart() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [metricType, setMetricType] = useState<MetricType>('views');
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);
  const [campaignSelectOpen, setCampaignSelectOpen] = useState(false);
  
  const { data: campaigns = [] } = useQuery({
    queryKey: ['/api/campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/campaigns');
      return response.json();
    },
    refetchInterval: 3000 // Auto-refresh every 3 seconds for real-time updates
  });

  // Sort campaigns by creation date (newest first), then limit to 10
  const availableCampaigns = useMemo(() => {
    return [...campaigns]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 10);
  }, [campaigns]);

  // Get campaign stats for ranking
  const campaignStats = useMemo(() => {
    const stats: Record<number, {views: number, clicks: number}> = {};
    for (const campaign of availableCampaigns) {
      stats[campaign.id] = {
        views: campaign.views || 0,
        clicks: campaign.clicks || 0
      };
    }
    return stats;
  }, [availableCampaigns]);

  // Auto-select top 3 campaigns based on current metric
  React.useEffect(() => {
    if (availableCampaigns.length > 0 && Object.keys(campaignStats).length > 0) {
      const sortedCampaigns = [...availableCampaigns].sort((a, b) => {
        const statA = campaignStats[a.id] || { views: 0, clicks: 0 };
        const statB = campaignStats[b.id] || { views: 0, clicks: 0 };
        
        if (metricType === 'views') {
          return statB.views - statA.views;
        } else {
          return statB.clicks - statA.clicks;
        }
      });
      
      const topCampaigns = sortedCampaigns.slice(0, Math.min(3, sortedCampaigns.length)).map(c => c.id);
      setSelectedCampaigns(topCampaigns);
    }
  }, [availableCampaigns, metricType, campaignStats]);

  // Format campaign name with character limit
  const formatCampaignName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  // Format creation date
  const formatCreationDate = (dateString: string | null) => {
    if (!dateString) return 'Data não disponível';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  // Toggle campaign selection
  const toggleCampaignSelection = (campaignId: number) => {
    setSelectedCampaigns(prev => {
      if (prev.includes(campaignId)) {
        return prev.filter(id => id !== campaignId);
      } else {
        // Limit to maximum 10 campaigns
        if (prev.length >= 10) {
          return [...prev.slice(1), campaignId];
        }
        return [...prev, campaignId];
      }
    });
  };

  // Fetch chart data with real-time updates
  const { data: chartData = [], isLoading: isLoadingData } = useQuery({
    queryKey: ['analytics-chart', selectedCampaigns, timeFilter, metricType],
    queryFn: () => fetchAnalyticsData(selectedCampaigns, timeFilter, metricType),
    enabled: selectedCampaigns.length > 0,
    refetchInterval: 5000, // Auto-refresh every 5 seconds for real-time updates
    staleTime: 0
  });

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'day': return 'Últimas 24 horas';
      case 'week': return 'Últimos 7 dias';
      case 'month': return 'Últimos 30 dias';
      case 'year': return 'Último ano';
      default: return 'Período selecionado';
    }
  };

  return (
    <Card className="border-0 shadow-lg rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Performance das Presells
            </CardTitle>
            <CardDescription>
              Acompanhe o desempenho das suas presells ao longo do tempo
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {metricType === 'views' ? (
              <Eye className="h-4 w-4 text-purple-600" />
            ) : (
              <MousePointer className="h-4 w-4 text-orange-600" />
            )}
            <span className="text-sm text-gray-600">
              {metricType === 'views' ? 'Visualizações' : 'Cliques'}
            </span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mt-4">
          {/* Time Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Por Hora</SelectItem>
                <SelectItem value="week">Por Dia</SelectItem>
                <SelectItem value="month">Por Mês</SelectItem>
                <SelectItem value="year">Por Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Metric Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={metricType === 'views' ? 'default' : 'ghost'}
              onClick={() => setMetricType('views')}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Visualizações
            </Button>
            <Button
              size="sm"
              variant={metricType === 'clicks' ? 'default' : 'ghost'}
              onClick={() => setMetricType('clicks')}
              className="text-xs"
            >
              <MousePointer className="h-3 w-3 mr-1" />
              Cliques
            </Button>
          </div>

          {/* Campaign Selection */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Selecionar Presells (máximo 10) - {selectedCampaigns.length}/10 selecionadas
            </span>
            
            <Popover open={campaignSelectOpen} onOpenChange={setCampaignSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={campaignSelectOpen}
                  className="w-auto justify-between min-w-[200px]"
                >
                  <div className="flex items-center gap-2">
                    {selectedCampaigns.length > 0 ? (
                      <div className="flex gap-1">
                        {selectedCampaigns.slice(0, 2).map((id, index) => {
                          const campaign = availableCampaigns.find(c => c.id === id);
                          return (
                            <Badge key={id} variant="secondary" className="text-xs px-1">
                              {formatCampaignName(campaign?.name || `#${id}`, 10)}
                            </Badge>
                          );
                        })}
                        {selectedCampaigns.length > 2 && (
                          <Badge variant="secondary" className="text-xs px-1">
                            +{selectedCampaigns.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      "Selecionar campanhas..."
                    )}
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-3 border-b">
                  <h4 className="font-medium text-sm">Selecionar Campanhas</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    As 3 melhores por {metricType === 'views' ? 'visualizações' : 'cliques'} são selecionadas automaticamente
                  </p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {availableCampaigns.map((campaign) => {
                    const isSelected = selectedCampaigns.includes(campaign.id);
                    const colorIndex = selectedCampaigns.findIndex(id => id === campaign.id);
                    const color = colorIndex !== -1 ? colors[colorIndex % colors.length] : '#6B7280';
                    const stats = campaignStats[campaign.id] || { views: 0, clicks: 0 };
                    const currentMetricValue = metricType === 'views' ? stats.views : stats.clicks;
                    
                    return (
                      <div 
                        key={campaign.id}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => toggleCampaignSelection(campaign.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleCampaignSelection(campaign.id)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {formatCampaignName(campaign.name, 25)}
                            </span>
                            <Badge variant="outline" className="text-xs ml-2">
                              {currentMetricValue} {metricType === 'views' ? 'views' : 'clicks'}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Criada em: {formatCreationDate(campaign.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {selectedCampaigns.length} de {availableCampaigns.length} selecionadas
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCampaignSelectOpen(false)}
                      className="text-xs"
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {availableCampaigns.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma presell encontrada</p>
              <p className="text-sm mt-2">Crie sua primeira presell para visualizar o gráfico de performance</p>
            </div>
          </div>
        ) : selectedCampaigns.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Selecione pelo menos uma presell para visualizar o gráfico</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Período: {getTimeFilterLabel()}
              </span>
              <span className="text-xs text-gray-500">
                {isLoadingData ? 'Carregando...' : `${chartData.length} pontos de dados`}
              </span>
            </div>
            {isLoadingData ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart 
                  data={chartData} 
                  margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.7} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6B7280"
                    fontSize={12}
                    axisLine={{ stroke: '#d1d5db' }}
                    tickLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    axisLine={{ stroke: '#d1d5db' }}
                    tickLine={{ stroke: '#d1d5db' }}
                    domain={[0, 'dataMax + 10']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '14px'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                    formatter={(value: any, name: string) => {
                      const foundCampaign = availableCampaigns.find(c => name === c.name);
                      return [
                        `${value} ${metricType === 'views' ? 'visualizações' : 'cliques'}`,
                        foundCampaign?.name || name
                      ];
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  {selectedCampaigns.map((campaignId, index) => {
                    const campaign = availableCampaigns.find(c => c.id === campaignId);
                    return (
                      <Line
                        key={campaignId}
                        name={campaign?.name || `Campaign ${campaignId}`}
                        type="monotone"
                        dataKey={`campaign_${campaignId}`}
                        stroke={colors[index % colors.length]}
                        strokeWidth={3}
                        dot={{ 
                          fill: colors[index % colors.length], 
                          strokeWidth: 2, 
                          r: 5,
                          fillOpacity: 1
                        }}
                        activeDot={{ 
                          r: 8, 
                          stroke: colors[index % colors.length], 
                          strokeWidth: 2,
                          fill: colors[index % colors.length]
                        }}
                        connectNulls={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}