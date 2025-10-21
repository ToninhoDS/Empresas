import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Save, Loader2 } from "lucide-react";
import { insertCampaignSchema, updateCampaignSchema, type Campaign, type InsertCampaign, type UpdateCampaign } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface CampaignFormProps {
  campaign?: Campaign;
  onSuccess: () => void;
}

export default function CampaignForm({ campaign, onSuccess }: CampaignFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!campaign;

  const schema = isEditing ? updateCampaignSchema : insertCampaignSchema;
  
  const form = useForm<InsertCampaign | UpdateCampaign>({
    resolver: zodResolver(schema),
    defaultValues: campaign ? {
      name: campaign.name,
      description: campaign.description || "",
      sourceUrl: campaign.sourceUrl,
      affiliateUrl: campaign.affiliateUrl,
      cloningMode: campaign.cloningMode,
      isActive: campaign.isActive,
      enableCookieModal: campaign.enableCookieModal,
      cookieModalLanguage: campaign.cookieModalLanguage,
      cookieModalTitle: campaign.cookieModalTitle,
      cookieModalText: campaign.cookieModalText,
      cookiePolicyLink: campaign.cookiePolicyLink || "none",
      acceptButtonText: campaign.acceptButtonText,
      closeButtonText: campaign.closeButtonText,
      acceptButtonPosition: campaign.acceptButtonPosition,
      acceptButtonShadow: campaign.acceptButtonShadow,
      closeButtonPosition: campaign.closeButtonPosition,
      closeButtonShadow: campaign.closeButtonShadow,
      backgroundColor: campaign.backgroundColor,
      borderColor: campaign.borderColor,
      shadowIntensity: campaign.shadowIntensity,
    } : {
      name: "",
      description: "",
      sourceUrl: "",
      affiliateUrl: "",
      cloningMode: "automatic",
      isActive: true,
      enableCookieModal: true,
      cookieModalLanguage: "english",
      cookieModalTitle: "Cookie Policy",
      cookieModalText: "We use cookies to enhance your experience by personalizing content, ads, and social features. By continuing to browse or clicking Accept, you agree to this.",
      cookiePolicyLink: "none",
      acceptButtonText: "Accept",
      closeButtonText: "Close",
      acceptButtonPosition: "bottom-right",
      acceptButtonShadow: false,
      closeButtonPosition: "bottom-right",
      closeButtonShadow: false,
      backgroundColor: "#ffffff",
      borderColor: "#e5e7eb",
      shadowIntensity: 2
    },
  });

  // Estado para controlar a visualização em tempo real
  const [cookieModalPreview, setCookieModalPreview] = useState({
    title: form.getValues('cookieModalTitle') || 'Política de Cookies',
    text: form.getValues('cookieModalText') || 'Usamos cookies para deixar sua experiência ainda melhor, personalizando conteúdos, anúncios e recursos sociais. Ao continuar navegando ou clicar em Aceitar, você concorda com isso. Saiba mais em nossa',
    acceptButtonText: form.getValues('acceptButtonText') || 'Aceitar',
    closeButtonText: form.getValues('closeButtonText') || 'Fechar',
    policyLink: form.getValues('cookiePolicyLink') || '',
    policyLinkText: '',
    acceptButtonPosition: form.getValues('acceptButtonPosition') || 'bottom-right',
    closeButtonPosition: form.getValues('closeButtonPosition') || 'bottom-right',
    acceptButtonShadow: form.getValues('acceptButtonShadow') || false,
    closeButtonShadow: form.getValues('closeButtonShadow') || false,
    backgroundColor: form.getValues('backgroundColor') || '#ffffff',
    borderColor: form.getValues('borderColor') || '#e5e7eb',
    shadowIntensity: form.getValues('shadowIntensity') || 2,
  });

  // Textos padrão para cada idioma
  const defaultTexts = {
    english: {
      title: 'Cookie Policy',
      text: 'We use cookies to enhance your experience by personalizing content, ads, and social features. By continuing to browse or clicking Accept, you agree to this. Learn more in our.',
      acceptButtonText: 'Accept',
      closeButtonText: 'Close',
      policyLinkOptions: [
        { value: 'none', label: 'Empty' },
        { value: 'Learn more', label: 'Learn more' },
        { value: 'Cookie Policy', label: 'Cookie Policy' },
      ],
    },
    portuguese: {
      title: 'Política de Cookies',
      text: 'Usamos cookies para deixar sua experiência ainda melhor, personalizando conteúdos, anúncios e recursos sociais. Ao continuar navegando ou clicar em Aceitar, você concorda com isso.',
      acceptButtonText: 'Aceitar',
      closeButtonText: 'Fechar',
      policyLinkOptions: [
        { value: 'none', label: 'Vazio' },
        { value: 'Saiba mais', label: 'Saiba mais' },
        { value: 'Política de Cookies', label: 'Política de Cookies' },
      ],
    },
  };

  // Atualiza os campos quando o idioma é alterado
  useEffect(() => {
    const language = form.getValues('cookieModalLanguage');
    const defaults = defaultTexts[language as keyof typeof defaultTexts];
    
    if (defaults) {
      form.setValue('cookieModalTitle', defaults.title);
      form.setValue('cookieModalText', defaults.text);
      form.setValue('acceptButtonText', defaults.acceptButtonText);
      form.setValue('closeButtonText', defaults.closeButtonText);
      form.setValue('cookiePolicyLink', 'none');
      
      setCookieModalPreview({
        title: defaults.title,
        text: defaults.text,
        acceptButtonText: defaults.acceptButtonText,
        closeButtonText: defaults.closeButtonText,
        policyLink: form.getValues('affiliateUrl') || '',
        policyLinkText: '',
        acceptButtonPosition: form.getValues('acceptButtonPosition') || 'bottom-right',
        closeButtonPosition: form.getValues('closeButtonPosition') || 'bottom-right',
        acceptButtonShadow: form.getValues('acceptButtonShadow') || false,
        closeButtonShadow: form.getValues('closeButtonShadow') || false,
        backgroundColor: form.getValues('backgroundColor') || '#ffffff',
        borderColor: form.getValues('borderColor') || '#e5e7eb',
        shadowIntensity: form.getValues('shadowIntensity') || 2,
      });
    }
  }, [form.watch('cookieModalLanguage')]);

  // Atualiza o preview quando os campos relevantes mudam
  useEffect(() => {
    const formValues = form.watch();
    const language = formValues.cookieModalLanguage;
    const policyLink = formValues.cookiePolicyLink;

    setCookieModalPreview({
      title: formValues.cookieModalTitle || '',
      text: formValues.cookieModalText || '',
      policyLink: formValues.affiliateUrl || '',
      policyLinkText: policyLink === 'none' ? '' : defaultTexts[language as keyof typeof defaultTexts]?.policyLinkOptions.find(
        (option) => option.value === policyLink
      )?.label || '',
      acceptButtonText: formValues.acceptButtonText || '',
      closeButtonText: formValues.closeButtonText || '',
      acceptButtonPosition: formValues.acceptButtonPosition || 'bottom-right',
      closeButtonPosition: formValues.closeButtonPosition || 'bottom-right',
      acceptButtonShadow: formValues.acceptButtonShadow,
      closeButtonShadow: formValues.closeButtonShadow,
      backgroundColor: formValues.backgroundColor,
      borderColor: formValues.borderColor,
      shadowIntensity: formValues.shadowIntensity
    });
  }, [form.watch(), defaultTexts]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertCampaign) => {
      const response = await apiRequest("POST", "/api/campaigns", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      onSuccess();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateCampaign) => {
      const response = await apiRequest("PATCH", `/api/campaigns/${campaign!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      onSuccess();
    },
  });

  const onSubmit = (data: InsertCampaign | UpdateCampaign) => {
    if (isEditing) {
      updateMutation.mutate(data as UpdateCampaign);
    } else {
      createMutation.mutate(data as InsertCampaign);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Campanha *</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome da campanha" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cloningMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modo de Clonagem</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditing}>
                  <FormControl>
                    <SelectTrigger disabled={isEditing}>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="automatic">Automático (Clone + Fallback Screenshot)</SelectItem>
                    <SelectItem value="clone-only">Apenas Clone</SelectItem>
                    <SelectItem value="screenshot-only">Apenas Screenshot</SelectItem>
                  </SelectContent>
                </Select>
                {isEditing && (
                  <div className="text-xs text-gray-500 mt-1">Modo de clonagem não pode ser alterado após a criação da campanha.</div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="sourceUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de Origem para Clonar *</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://exemplo.com/pagina-vendas"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="affiliateUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de Redirecionamento do Afiliado *</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://link-afiliado.com"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição da Campanha</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Breve descrição da campanha"
                  rows={3}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cookie Modal Settings */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Configurações do Modal de Cookie</CardTitle>
            <CardDescription>
              Configure o modal de consentimento de cookies que aparece na sua presell
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Modal de Cookie sempre ativo - campo oculto */}
            <input type="hidden" {...form.register("enableCookieModal")} value="true" />
            
            {/* Linha 1: Idioma, Título e Saiba Mais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="cookieModalLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idioma</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="english">Inglês</SelectItem>
                        <SelectItem value="portuguese">Português</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cookieModalTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Modal</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cookiePolicyLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saiba Mais Cookies</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || undefined}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {defaultTexts[form.getValues('cookieModalLanguage') as keyof typeof defaultTexts]?.policyLinkOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Linha 2: Texto da Política de Cookies */}
            <FormField
              control={form.control}
              name="cookieModalText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto da Política de Cookies</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Utilizamos cookies para melhorar sua experiência..."
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Linha 3: Botão Aceitar, Posicionamento e Sombra */}
            <div className="grid grid-cols-1 md:grid-cols-[8fr,8fr,4fr] gap-4">
              <FormField
                control={form.control}
                name="acceptButtonText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto do Botão Aceitar</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptButtonPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posição do Botão Aceitar</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bottom-right">Canto inferior direito (&gt;)</SelectItem>
                        <SelectItem value="bottom-left">Canto inferior esquerdo (&lt;)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptButtonShadow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sombra</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Converter para boolean antes de passar para o campo
                        field.onChange(value !== "none");
                      }} 
                      defaultValue={field.value ? "2" : "none"}
                      value={field.value ? "2" : "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sem sombra</SelectItem>
                        <SelectItem value="1">Leve</SelectItem>
                        <SelectItem value="2">Média</SelectItem>
                        <SelectItem value="3">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Linha 4: Botão Fechar, Posicionamento e Sombra */}
            <div className="grid grid-cols-1 md:grid-cols-[8fr,8fr,4fr] gap-4">
              <FormField
                control={form.control}
                name="closeButtonText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto do Botão Fechar</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closeButtonPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posição do Botão Fechar</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bottom-right">Canto inferior direito (&gt;)</SelectItem>
                        <SelectItem value="bottom-left">Canto inferior esquerdo (&lt;)</SelectItem>
                        <SelectItem value="top-right">Canto superior direito (&gt;)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closeButtonShadow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sombra</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Converter para boolean antes de passar para o campo
                        field.onChange(value !== "none");
                      }} 
                      defaultValue={field.value ? "2" : "none"}
                      value={field.value ? "2" : "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sem sombra</SelectItem>
                        <SelectItem value="1">Leve</SelectItem>
                        <SelectItem value="2">Média</SelectItem>
                        <SelectItem value="3">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Linha 5: Cores e Sombras */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="backgroundColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor de Fundo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="#ffffff">Branco</SelectItem>
                        <SelectItem value="#f3f4f6">Cinza Claro</SelectItem>
                        <SelectItem value="#fafafa">Gelo</SelectItem>
                        <SelectItem value="#f0f9ff">Azul Claro</SelectItem>
                        <SelectItem value="#fee2e2">Vermelho Claro</SelectItem>
                        <SelectItem value="#ef4444">Vermelho</SelectItem>
                        <SelectItem value="#dcfce7">Verde Claro</SelectItem>
                        <SelectItem value="#22c55e">Verde</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="borderColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor da Borda</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="#e5e7eb">Cinza Neutro</SelectItem>
                        <SelectItem value="#d1d5db">Cinza Médio</SelectItem>
                        <SelectItem value="#3b82f6">Azul</SelectItem>
                        <SelectItem value="#10b981">Verde</SelectItem>
                        <SelectItem value="#fca5a5">Vermelho Claro</SelectItem>
                        <SelectItem value="#dc2626">Vermelho</SelectItem>
                        <SelectItem value="#000000">Preto</SelectItem>
                        <SelectItem value="#9333ea">Roxo</SelectItem>
                        <SelectItem value="#eab308">Amarelo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shadowIntensity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intensidade da Sombra</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Converter para número antes de passar para o campo
                        field.onChange(Number(value));
                      }} 
                      defaultValue={String(field.value)}
                      value={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Suave</SelectItem>
                        <SelectItem value="2">Média</SelectItem>
                        <SelectItem value="3">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Preview do Modal de Cookies em tempo real */}
            <div className="mt-6 border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">Visualização em tempo real:</h3>
              <div className="bg-black bg-opacity-10 p-4 rounded-lg">
                <div 
                  className="bg-white rounded-lg shadow-lg w-full max-w-full overflow-hidden relative"
                  style={{
                    backgroundColor: form.getValues('backgroundColor'),
                    borderColor: form.getValues('borderColor'),
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    boxShadow: `0 4px ${6 * form.getValues('shadowIntensity')}px ${2 * form.getValues('shadowIntensity')}px rgba(0, 0, 0, 0.08)`
                  }}
                >
                  <div className="p-6">
                    <h4 className="text-lg font-semibold mb-3" style={{
                      color: ['#ef4444', '#22c55e'].includes(form.getValues('backgroundColor')) ? '#ffffff' : 'inherit',
                      textShadow: ['#ef4444', '#22c55e'].includes(form.getValues('backgroundColor')) ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                    }}>{cookieModalPreview.title}</h4>
                    <p style={{
                      color: ['#ef4444', '#22c55e'].includes(form.getValues('backgroundColor')) ? '#ffffff' : '#4b5563',
                      textShadow: ['#ef4444', '#22c55e'].includes(form.getValues('backgroundColor')) ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                    }} className="mb-6 text-base">
                      {cookieModalPreview.text}
                      {cookieModalPreview.policyLinkText && cookieModalPreview.policyLinkText !== '' && cookieModalPreview.policyLinkText !== 'none' && (
                        <>
                          {" "}
                          <a 
                            href={cookieModalPreview.policyLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline hover:no-underline"
                            style={{
                              color: ['#ef4444', '#22c55e'].includes(form.getValues('backgroundColor')) ? '#ffffff' : '#3b82f6',
                              textShadow: ['#ef4444', '#22c55e'].includes(form.getValues('backgroundColor')) ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                            }}
                          >
                            {cookieModalPreview.policyLinkText}
                          </a>
                        </>
                      )}
                    </p>
                    <div className="w-full">
                      <div className="w-full flex gap-2" style={{
                        justifyContent: form.watch('acceptButtonPosition') === 'bottom-left' ? 'flex-start' : 'flex-end'
                      }}>
                        {form.watch('closeButtonPosition') !== 'top-right' && form.watch('closeButtonPosition') === 'bottom-left' && (
                          <div 
                          className="px-4 py-2 bg-gray-100 rounded text-sm font-medium cursor-default select-none"
                          style={{
                            boxShadow: form.watch('closeButtonShadow') ? `0 2px 8px 2px rgba(0, 0, 0, 0.06)` : 'none'
                          }}
                        >
                          {cookieModalPreview.closeButtonText}
                        </div>
                        )}
                        <div 
                          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium cursor-default select-none"
                          style={{
                            boxShadow: form.watch('acceptButtonShadow') ? `0 2px 8px 2px rgba(0, 0, 0, 0.12)` : 'none'
                          }}
                        >
                          {cookieModalPreview.acceptButtonText}
                        </div>
                        {form.watch('closeButtonPosition') !== 'top-right' && form.watch('closeButtonPosition') === 'bottom-right' && (
                          <div 
                            className="px-4 py-2 bg-gray-100 rounded text-sm font-medium cursor-default select-none"
                            style={{
                              boxShadow: form.watch('closeButtonShadow') ? `0 2px 8px 2px rgba(0, 0, 0, 0.06)` : 'none'
                            }}
                          >
                            {cookieModalPreview.closeButtonText}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {form.watch('closeButtonPosition') === 'top-right' && (
                      <div 
                        className="absolute top-2 right-2 px-2 py-1 bg-gray-100 rounded text-sm font-medium cursor-default select-none"
                        style={{
                          boxShadow: form.watch('closeButtonShadow') ? `0 2px 8px 2px rgba(0, 0, 0, 0.06)` : 'none'
                        }}
                      >
                        {cookieModalPreview.closeButtonText}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t">
          <div className="max-w-3xl mx-auto flex justify-end">
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar Alterações" : "Criar Campanha"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}


interface FormData {
  cookieModalLanguage: string;
  cookieModalTitle: string;
  cookieModalText: string;
  cookiePolicyLink: string;
  acceptButtonText: string;
  closeButtonText: string;
  acceptButtonPosition: "bottom-right" | "bottom-left";
  acceptButtonShadow: boolean;
  closeButtonPosition: "bottom-right" | "bottom-left" | "top-right";
  closeButtonShadow: boolean;
  backgroundColor: string;
  borderColor: string;
  shadowIntensity: number;
}
