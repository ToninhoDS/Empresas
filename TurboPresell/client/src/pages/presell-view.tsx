import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { Campaign } from "@shared/schema";

export default function PresellView() {
  const [, params] = useRoute("/p/:shortUrl");
  const shortUrl = params?.shortUrl;

  const { data: campaign, isLoading } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/by-short-url/${shortUrl}`],
    enabled: !!shortUrl,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando campanha...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campanha Não Encontrada</h1>
          <p className="text-gray-600">A campanha solicitada não foi encontrada ou está inativa.</p>
        </div>
      </div>
    );
  }

  // The actual presell content is served by the backend at /p/:shortUrl
  // This component is just a fallback in case someone accesses via React routing
  window.location.href = `/p/${shortUrl}`;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}
