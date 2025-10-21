import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  MousePointer, 
  BarChart3,
  ExternalLink 
} from "lucide-react";

interface Campaign {
  id: number;
  name: string;
  views: number;
  clicks: number;
  createdAt: string;
  isActive: boolean;
  shortUrl: string;
}

type SortField = 'name' | 'views' | 'clicks' | 'ctr';
type SortDirection = 'asc' | 'desc';

export default function PerformanceTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('views');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);

  const { data: campaigns = [] } = useQuery({
    queryKey: ['/api/campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/campaigns');
      return response.json();
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns.filter((campaign: Campaign) =>
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a: Campaign, b: Campaign) => {
      let valueA: any = a[sortField];
      let valueB: any = b[sortField];

      if (sortField === 'name') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      } else if (sortField === 'ctr') {
        valueA = a.views > 0 ? (a.clicks / a.views) * 100 : 0;
        valueB = b.views > 0 ? (b.clicks / b.views) * 100 : 0;
      }

      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    return filtered;
  }, [campaigns, searchTerm, sortField, sortDirection]);

  const calculateCTR = (clicks: number, views: number) => {
    return views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';
  };

  const getPerformanceColor = (ctr: number) => {
    if (ctr >= 5) return 'bg-green-100 text-green-800';
    if (ctr >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="border-0 shadow-lg rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Tabela de Performance
            </CardTitle>
            <CardDescription>
              Visualize e compare o desempenho de todas as suas presells
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            {filteredAndSortedCampaigns.length} presells
          </Badge>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar presells pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {selectedCampaign && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedCampaign(null)}
            >
              Limpar Seleção
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {filteredAndSortedCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">
              {searchTerm ? 'Nenhuma presell encontrada' : 'Nenhuma presell criada ainda'}
            </p>
            {searchTerm && (
              <p className="text-sm text-gray-400">
                Tente ajustar o termo de busca
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('name')}
                      className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                    >
                      Nome da Presell
                      {getSortIcon('name')}
                    </Button>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('views')}
                      className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizações
                      {getSortIcon('views')}
                    </Button>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('clicks')}
                      className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <MousePointer className="h-4 w-4" />
                      Cliques
                      {getSortIcon('clicks')}
                    </Button>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('ctr')}
                      className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                    >
                      CTR (%)
                      {getSortIcon('ctr')}
                    </Button>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCampaigns.map((campaign: Campaign) => {
                  const ctr = parseFloat(calculateCTR(campaign.clicks, campaign.views));
                  const isSelected = selectedCampaign === campaign.id;
                  
                  return (
                    <tr
                      key={campaign.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedCampaign(isSelected ? null : campaign.id)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                            {campaign.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            /{campaign.shortUrl}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">{campaign.views.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <MousePointer className="h-4 w-4 text-orange-600" />
                          <span className="font-medium">{campaign.clicks.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge 
                          variant="secondary" 
                          className={getPerformanceColor(ctr)}
                        >
                          {ctr}%
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge 
                          variant={campaign.isActive ? "default" : "secondary"}
                          className={campaign.isActive ? "bg-green-100 text-green-800" : ""}
                        >
                          {campaign.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/p/${campaign.shortUrl}`, '_blank');
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {selectedCampaign && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Presell Selecionada</span>
            </div>
            <p className="text-sm text-blue-700">
              Clique em uma linha da tabela para destacar uma presell específica no gráfico acima.
              A presell selecionada será destacada nas visualizações.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}