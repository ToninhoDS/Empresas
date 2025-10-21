import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, CheckCircle, Eye, MousePointer } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { playClickSound } from "@/lib/sound";
import type { Campaign } from "@shared/schema";

interface StatsCardsProps {
  campaigns: Campaign[];
}

export default function StatsCards({ campaigns }: StatsCardsProps) {
  const [highlightedCards, setHighlightedCards] = useState<Set<number>>(new Set());
  const [previousValues, setPreviousValues] = useState<number[]>([0, 0, 0, 0]);
  const [isInitialized, setIsInitialized] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.isActive).length;
  const totalViews = campaigns.reduce((sum, c) => sum + (c.views ?? 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks ?? 0), 0);

  const currentValues = [totalCampaigns, activeCampaigns, totalViews, totalClicks];

  // Initialize values on first load without triggering sounds
  useEffect(() => {
    if (campaigns.length > 0 && !isInitialized) {
      setPreviousValues(currentValues);
      setIsInitialized(true);
    }
  }, [campaigns.length, isInitialized, currentValues]);

  // Trigger animation and sound for cards that actually changed (only after initialization)
  useEffect(() => {
    if (campaigns.length > 0 && isInitialized) {
      const changedCards = new Set<number>();
      
      currentValues.forEach(async (value, index) => {
        if (value !== previousValues[index]) {
          changedCards.add(index);
          
          // Play sound for clicks card (index 3) when value increases (not decreases)
          if (index === 3 && value > previousValues[index]) {
            // console.log(`Som disparado: cliques aumentaram de ${previousValues[index]} para ${value}`);
            await playClickSound();
          }
        }
      });

      if (changedCards.size > 0) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        setHighlightedCards(changedCards);
        setPreviousValues(currentValues);
        
        // Set new timeout to clear highlights
        timeoutRef.current = setTimeout(() => {
          // console.log("Removendo highlight dos cards após 3 segundos");
          setHighlightedCards(new Set());
          timeoutRef.current = null;
        }, 3000);
      }
    }
  }, [totalCampaigns, activeCampaigns, totalViews, totalClicks]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const stats = [
    {
      label: "Total de Presells",
      value: totalCampaigns,
      icon: TrendingUp,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100/50"
    },
    {
      label: "Presells Ativas",
      value: activeCampaigns,
      icon: CheckCircle,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      bgGradient: "bg-gradient-to-br from-emerald-50 to-cyan-50"
    },
    {
      label: "Total de Visualizações",
      value: totalViews,
      icon: Eye,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      bgGradient: "bg-gradient-to-br from-purple-50 to-indigo-50"
    },
    {
      label: "Total de Cliques",
      value: totalClicks,
      icon: MousePointer,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      bgGradient: "bg-gradient-to-br from-orange-50 to-red-50"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className={`group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl relative min-h-[130px] ${highlightedCards.has(index) ? 'ring-1 ring-blue-400 ring-opacity-40 shadow-2xl' : ''}`}
          >
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform translate-x-[-100%] group-hover:translate-x-[100%] skew-x-12 z-20"></div>
            
            {/* Data Update Animation - Enhanced diagonal sweep */}
            <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-blue-200/35 to-transparent transition-all duration-3000 ease-in-out transform z-20 ${highlightedCards.has(index) ? 'translate-x-[175%] translate-y-[60%] opacity-100' : 'translate-x-[-175%] translate-y-[-60%] opacity-0'} rotate-12`}></div>
            
            {/* Enhanced glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-400/8 to-cyan-400/8 rounded-2xl transition-opacity duration-1000 ${highlightedCards.has(index) ? 'opacity-100' : 'opacity-0'}`}></div>
            
            <CardContent className={`p-0 ${stat.bgGradient} relative z-10 h-full`}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold text-gray-800 transition-all duration-700 ${highlightedCards.has(index) ? 'scale-110 text-blue-700' : ''}`}>{stat.value}</p>
                  </div>
                  <div className={`${stat.iconBg} p-4 rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-700 ${highlightedCards.has(index) ? 'scale-110 shadow-xl' : ''}`}>
                    <Icon className={`h-8 w-8 ${stat.iconColor} transition-all duration-700 ${highlightedCards.has(index) ? 'scale-110' : ''}`} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
