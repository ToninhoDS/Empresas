import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Moon, Sun, Sparkles, Shield, Volume2, Play } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, saveSettings as saveSettingsAPI, type DatabaseSettings } from "@/lib/api";
import { DEFAULT_AI_PROMPT } from "@/lib/settings";
import UserMenu from "@/components/user-menu";
import AIChatModal from "@/components/ai-chat-modal";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Event listener para abrir o chat
  useEffect(() => {
    const handleOpenAIChat = () => {
      console.log('Evento openAIChat recebido na página Settings');
      setIsChatOpen(true);
    };
    window.addEventListener('openAIChat', handleOpenAIChat);
    return () => window.removeEventListener('openAIChat', handleOpenAIChat);
  }, []);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: fetchSettings
  });

  // Mutation to save settings
  const saveSettingsMutation = useMutation({
    mutationFn: saveSettingsAPI,
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/settings"], data);
      // Apply theme immediately
      setTheme(data.darkMode ? "dark" : "light");
      toast({
        title: "Configurações Salvas",
        description: "Suas configurações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error saving settings:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações.",
        variant: "destructive",
      });
    }
  });

  // Default settings if none exist
  const defaultSettings: Partial<DatabaseSettings> = {
    darkMode: false,
    cardEffects: true,
    bulkDeleteProtection: false,
    soundNotifications: false,
    clickSoundFile: "1 - cute_notification_1750530967074.mp3",
    aiApiKey: "",
    aiPersonalities: [],
    aiBehaviorPrompt: DEFAULT_AI_PROMPT,
    aiSuggestQuestions: true,
    useDefaultPersonality: true
  };

  const [currentSettings, setCurrentSettings] = useState<Partial<DatabaseSettings>>(settings || defaultSettings);

  useEffect(() => {
    if (settings) {
      setCurrentSettings(settings);
    }
  }, [settings]);

  const soundFiles = [
    "1 - cute_notification_1750530967074.mp3",
    "2 - live-chat_1750530967074.mp3", 
    "3 - notification duplo_1750530967075.mp3",
    "4 - correct_1750530967075.mp3",
    "5 - tiktok_drop_sample_1750530967075.mp3",
    "6 - notify_1750530967076.mp3",
    "7pop-cartoon_1750530967076.mp3",
    "8 - sample_confirm_success_1750530967076.mp3",
    "9 - awesome-level-up_1750530967077.mp3",
    "10 - pop-up-notify-smooth-modern_1750530967077.mp3",
    "11 - fresh-notification_1750530967077.mp3"
  ];

  const handleSave = () => {
    if (!currentSettings) return;
    
    // Atualiza o cache do React Query antes de salvar
    queryClient.setQueryData(["/api/settings"], currentSettings);
    
    // Salva as configurações no servidor
    saveSettingsMutation.mutate(currentSettings);
  };

  const updateSetting = <K extends keyof DatabaseSettings>(key: K, value: DatabaseSettings[K]) => {
    const updatedSettings = { ...currentSettings, [key]: value };
    setCurrentSettings(updatedSettings);
  };

  const playSound = async (filename: string) => {
    try {
      const audio = new Audio(`/sounds/${filename}`);
      audio.volume = 0.5;
      await audio.play();
    } catch (error) {
      console.error("Erro ao reproduzir som:", error);
      toast({
        title: "Erro",
        description: "Arquivo de som não encontrado ou formato não suportado.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/20">
      {/* Navbar */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-4">
            {/* Lado esquerdo: TurboPresell Brand */}
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
                Configurações
              </h2>
            </div>

            {/* User Profile Menu */}
            <div className="flex items-center space-x-4">
              <UserMenu 
                userName="John Doe"
                userRole="Administrador"
                userInitials="JD"
                // Remove showSettingsOption prop since it's not defined in UserMenuProps
              />
            </div>
          </div>
        </div>
      </header>

      {/* Botão Home */}
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="mb-8 flex justify-end">
          <Button 
            onClick={() => window.location.href='/'}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background hover:bg-accent hover:text-accent-foreground h-10 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-blue-200 text-blue-700 dark:from-blue-950 dark:to-cyan-950 dark:border-blue-800 dark:text-blue-300 px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>

        {/* Settings Tabs */}
        <div className="max-w-4xl">
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="appearance">Aparência</TabsTrigger>
              <TabsTrigger value="effects">Efeitos</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
              <TabsTrigger value="sounds">Sons</TabsTrigger>
              <TabsTrigger value="ai">Configuração AI</TabsTrigger>
            </TabsList>

            {/* Aparência */}
            <TabsContent value="appearance" className="space-y-4">
              <Card className="p-4 border-0 shadow-lg rounded-2xl">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                    {currentSettings.darkMode ? <Moon className="h-4 w-4 text-white" /> : <Sun className="h-4 w-4 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Aparência</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Configure o tema da interface</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Modo Escuro</label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Alterne entre o tema claro e escuro da interface</p>
                  </div>
                  <Switch
                    checked={currentSettings.darkMode}
                    onCheckedChange={(value) => updateSetting('darkMode', value)}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </Card>
            </TabsContent>

            {/* Efeitos Visuais */}
            <TabsContent value="effects" className="space-y-4">
              <Card className="p-4 border-0 shadow-lg rounded-2xl">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Efeitos Visuais</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Configure animações e efeitos dos elementos</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="card-effects"
                    checked={currentSettings.cardEffects}
                    onCheckedChange={(value) => updateSetting('cardEffects', !!value)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div className="space-y-1">
                    <label htmlFor="card-effects" className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                      Efeitos Visuais dos Cards
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Ativar sombras, transições suaves e efeitos visuais nos cards do dashboard
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Segurança */}
            <TabsContent value="security" className="space-y-4">
              <Card className="p-4 border-0 shadow-lg rounded-2xl">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Segurança</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Configure opções de proteção e segurança</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="bulk-delete-protection"
                    checked={currentSettings.bulkDeleteProtection}
                    onCheckedChange={(value) => updateSetting('bulkDeleteProtection', !!value)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div className="space-y-1">
                    <label htmlFor="bulk-delete-protection" className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                      Proteção de exclusão em massa
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Solicitar confirmação adicional ao excluir múltiplas presells simultaneamente
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Notificações Sonoras */}
            <TabsContent value="sounds" className="space-y-4">
              <Card className="p-4 border-0 shadow-lg rounded-2xl">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                    <Volume2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Notificações Sonoras</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Personalize sons de feedback para eventos importantes</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="sound-notifications"
                      checked={currentSettings.soundNotifications}
                      onCheckedChange={(value) => updateSetting('soundNotifications', !!value)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div className="space-y-1">
                      <label htmlFor="sound-notifications" className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                        Notificação sonora para novos cliques
                      </label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Reproduzir som sempre que houver novos cliques nas suas presells
                      </p>
                    </div>
                  </div>

                  {currentSettings.soundNotifications && (
                    <div className="ml-6 space-y-2">
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Som para Cliques</label>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={currentSettings.clickSoundFile}
                          onValueChange={(value) => updateSetting('clickSoundFile', value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {soundFiles.map((file) => (
                              <SelectItem key={file} value={file}>
                                {file.replace(/_\d+\.mp3$/, '').replace(/^\d+\s*-\s*/, '')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => currentSettings.clickSoundFile && playSound(currentSettings.clickSoundFile)}
                          className="flex-shrink-0"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Ouvir
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* AI Configuration Tab */}
            <TabsContent value="ai" className="space-y-6">
              <Card className="p-6 border-0 shadow-lg rounded-2xl">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Configuração da Inteligência Artificial</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure o comportamento e personalidade da IA para conversas no sistema
                    </p>
                  </div>
                </div>

                {/* API Key */}
                <div className="space-y-2 mb-6">
                  <Label htmlFor="ai-api-key">Chave API da IA</Label>
                  <Input
                    id="ai-api-key"
                    type="password"
                    placeholder="Insira sua chave de API"
                    value={currentSettings.aiApiKey || ""}
                    onChange={(e) => updateSetting('aiApiKey', e.target.value)}
                    className="max-w-md"
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta chave será usada para liberar os recursos de IA do sistema.
                  </p>
                </div>

                {/* AI Personalities */}
                <div className="space-y-4">
                  <Label>Personalidade da IA (Múltipla escolha)</Label>
                  <p className="text-sm text-muted-foreground">
                    Selecione os focos que influenciarão o tom e tipo de respostas da IA:
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      'Marketing Digital',
                      'Vendas Online', 
                      'Afiliados',
                      'Google Ads',
                      'Mercado Brasileiro',
                      'Produtos Internacionais',
                      'Produtos Digitais',
                      'E-commerce',
                      'Copywriting para Conversão',
                      'Tendências de Mercado'
                    ].map((personality) => (
                      <div key={personality} className="flex items-center space-x-2">
                        <Checkbox
                          id={`personality-${personality}`}
                          checked={currentSettings.aiPersonalities?.includes(personality) || false}
                          onCheckedChange={(checked) => {
                            const currentPersonalities = currentSettings.aiPersonalities || [];
                            if (checked) {
                              updateSetting('aiPersonalities', [...currentPersonalities, personality]);
                            } else {
                              updateSetting('aiPersonalities', currentPersonalities.filter(p => p !== personality));
                            }
                          }}
                        />
                        <Label 
                          htmlFor={`personality-${personality}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {personality}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Behavior Prompt */}
                <div className="space-y-2 mt-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ai-behavior">Comportamento Customizado</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="default-personality"
                        checked={currentSettings.useDefaultPersonality || false}
                        onCheckedChange={(value) => {
                          const useDefault = !!value;
                          updateSetting('useDefaultPersonality', useDefault);
                          if (useDefault) {
                            updateSetting('aiBehaviorPrompt', DEFAULT_AI_PROMPT);
                          }
                        }}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label htmlFor="default-personality" className="text-sm cursor-pointer">
                        Personalidade Padrão
                      </Label>
                    </div>
                  </div>
                  <Textarea
                    id="ai-behavior"
                    placeholder="Ex: Você é um assistente de marketing digital especializado em estratégias, copywriting e vendas online. Sempre responda com clareza, objetividade e sem repetir a pergunta do usuário."
                    value={currentSettings.aiBehaviorPrompt || ""}
                    onChange={(e) => updateSetting('aiBehaviorPrompt', e.target.value)}
                    className="min-h-[100px] resize-none"
                    disabled={currentSettings.useDefaultPersonality || false}
                  />
                  <p className="text-xs text-muted-foreground">
                    {currentSettings.useDefaultPersonality 
                      ? "Usando personalidade padrão da Consultora Liana - desmarque para personalizar"
                      : "Defina como a IA deve se comportar e responder durante as conversas"
                    }
                  </p>
                </div>

                {/* AI Suggest Questions */}
                <div className="flex items-start space-x-3 mt-6">
                  <Checkbox
                    id="ai-suggest-questions"
                    checked={currentSettings.aiSuggestQuestions || false}
                    onCheckedChange={(value) => updateSetting('aiSuggestQuestions', !!value)}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 mt-0.5"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="ai-suggest-questions" className="text-sm font-medium cursor-pointer">
                      Sugerir perguntas de continuidade
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      A IA sugerirá perguntas relevantes ao final das respostas para manter a conversa ativa
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t mt-6">
                  <p className="text-sm text-muted-foreground">
                    As personalidades selecionadas influenciarão o estilo das análises e recomendações da IA
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Ações */}
          <div className="flex justify-end space-x-4 pt-4">
            <Link href="/">
              <Button variant="outline" className="rounded-lg">
                Cancelar
              </Button>
            </Link>
            <Button 
              onClick={handleSave}
              disabled={saveSettingsMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg"
            >
              {saveSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </div>
      </div>

      {/* AI Chat Modal */}
      <AIChatModal open={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  );
}