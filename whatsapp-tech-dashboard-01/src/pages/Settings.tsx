import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Lock, 
  Bell, 
  Eye, 
  EyeOff,
  CheckCircle2,
  AlertCircle,
  BugPlay,
  Settings2,
  CreditCard,
  MessageSquareWarning,
  Sun,
  Moon,
  AlertOctagon,
  ShieldAlert,
  BadgeInfo,
  Sparkles
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  cartao_ponto: string;
  cargo: string;
  departamentos: Array<{
    id: string;
    nome: string;
    sub_departamentos: Array<{
      id: string;
      nome: string;
    }>;
  }>;
}

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab');
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bugReport, setBugReport] = useState('');
  const [isAdminMaster, setIsAdminMaster] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      if (!user?.id) return;

      const { data: userData, error: userError } = await supabase
        .from('perfis_usuarios')
        .select(`
          id,
          nome,
          email,
          cartao_ponto,
          cargo,
          departamento_id,
          sub_departamento_id
        `)
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Buscar informações dos departamentos
      if (userData.departamento_id) {
        const { data: depData, error: depError } = await supabase
          .from('departamentos')
          .select(`
            id,
            nome,
            sub_departamentos (
              id,
              nome
            )
          `)
          .eq('id', userData.departamento_id)
          .single();

        if (depError) throw depError;

        setProfile({
          ...userData,
          departamentos: [{
            ...depData,
            sub_departamentos: depData.sub_departamentos.filter(
              (sub: any) => sub.id === userData.sub_departamento_id
            )
          }]
        });
      } else {
        setProfile({
          ...userData,
          departamentos: []
        });
      }

      // Verifica se é Admin-Master
      setIsAdminMaster(userData.isAdminMaster === true);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: "Erro ao carregar perfil",
        description: "Não foi possível carregar suas informações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (newPassword.length < 6) {
        throw new Error('A nova senha deve ter pelo menos 6 caracteres');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Atualizar senha_hash e senha_login na tabela perfis_usuarios
      const { error: updateError } = await supabase
        .from('perfis_usuarios')
        .update({
          senha_hash: newPassword,
          senha_login: newPassword
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso",
      });

      // Limpar campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBugReport = () => {
    if (!bugReport.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, descreva o problema encontrado.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Relatório enviado",
      description: "Obrigado por reportar o problema. Nossa equipe irá analisar.",
    });
    setBugReport('');
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // Aqui você implementaria a lógica real de mudança de tema
    toast({
      title: `Modo ${isDarkMode ? 'Claro' : 'Escuro'} ativado`,
      description: `O tema foi alterado para o modo ${isDarkMode ? 'claro' : 'escuro'}.`,
    });
  };

  // Helper function to translate and format role names
  const getRoleDisplay = (role: string) => {
    if (role.includes('+')) {
      const roles = role.split('+').map(r => r.trim());
      
      const translatedRoles = roles.map(r => {
        switch(r) {
          case 'admin': return 'Administrador';
          case 'supervisor': return 'Supervisor';
          case 'agent': return 'Atendente';
          default: return 'Usuário';
        }
      });
      
      return translatedRoles.join(' + ');
    } else {
      switch(role) {
        case 'admin': return 'Administrador';
        case 'supervisor': return 'Supervisor';
        case 'agent': return 'Atendente';
        default: return 'Usuário';
      }
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">Você precisa estar logado para acessar esta página.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Carregando configurações...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>

        <Tabs defaultValue="perfil" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="avisos" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Avisos
            </TabsTrigger>
            <TabsTrigger value="sistema" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Sistema
            </TabsTrigger>
            {isAdminMaster && (
              <TabsTrigger value="planos" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Planos
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="perfil" className="mt-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Informações do Perfil */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Perfil</CardTitle>
                  <CardDescription>
                    Visualize suas informações cadastrais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input value={profile?.nome || ''} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Cartão de Ponto</Label>
                      <Input value={profile?.cartao_ponto || ''} disabled />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={profile?.email || ''} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Função</Label>
                      <Input value={profile?.cargo || ''} disabled />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Departamentos e Subdepartamentos</Label>
                    <div className="p-4 border rounded-md space-y-4 max-h-[200px] overflow-y-auto">
                      {profile?.departamentos.map((dep) => (
                        <div key={dep.id} className="space-y-2">
                          <div className="font-medium">{dep.nome}</div>
                          <div className="flex flex-wrap gap-2">
                            {dep.sub_departamentos.map((sub) => (
                              <Badge key={sub.id} variant="secondary">
                                {sub.nome}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alterar Senha */}
              <Card>
                <CardHeader>
                  <CardTitle>Alterar Senha</CardTitle>
                  <CardDescription>
                    Altere sua senha de acesso ao sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={handleChangePassword}
                    disabled={!currentPassword || !newPassword || !confirmPassword}
                    className="w-full"
                  >
                    Alterar Senha
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="avisos" className="mt-6 space-y-6">
            {/* Seção de Avisos do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle>Avisos do Sistema</CardTitle>
                <CardDescription>
                  Fique por dentro das novidades, melhorias e atualizações importantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Avisos Importantes */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                      <AlertOctagon className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900">Manutenção Urgente</h4>
                        <p className="text-sm text-red-700">
                          Manutenção emergencial programada para hoje às 22h. Sistema ficará indisponível por 30 minutos.
                        </p>
                        <p className="text-xs text-red-600 mt-1">Há 2 horas atrás</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                      <Sparkles className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Nova Funcionalidade</h4>
                        <p className="text-sm text-green-700">
                          Agora você pode agendar mensagens para serem enviadas automaticamente.
                        </p>
                        <p className="text-xs text-green-600 mt-1">Há 1 dia atrás</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Anomalia Detectada</h4>
                        <p className="text-sm text-yellow-700">
                          Identificamos lentidão no envio de mensagens. Nossa equipe está trabalhando na correção.
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">Há 3 dias atrás</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                      <BadgeInfo className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Atualização do Sistema</h4>
                        <p className="text-sm text-blue-700">
                          Nova versão 2.1.0 disponível com melhorias de desempenho e correções de bugs.
                        </p>
                        <p className="text-xs text-blue-600 mt-1">Há 5 dias atrás</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção de Reportar Problemas */}
            <Card>
              <CardHeader>
                <CardTitle>Reportar Problemas</CardTitle>
                <CardDescription>
                  Encontrou algum problema ou bug? Nos ajude a melhorar reportando aqui
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo do Problema</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center justify-center"
                      >
                        <BugPlay className="mr-2 h-4 w-4 text-red-500" />
                        Bug no Sistema
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center justify-center"
                      >
                        <MessageSquareWarning className="mr-2 h-4 w-4 text-yellow-500" />
                        Problema de Uso
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição Detalhada</label>
                    <Textarea
                      placeholder="Descreva em detalhes o problema encontrado..."
                      value={bugReport}
                      onChange={(e) => setBugReport(e.target.value)}
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-gray-500">
                      Inclua o máximo de informações possível, como: onde ocorreu, o que estava fazendo, mensagens de erro, etc.
                    </p>
                  </div>

                  <Button 
                    type="button"
                    onClick={handleBugReport} 
                    className="w-full"
                  >
                    <BugPlay className="mr-2 h-4 w-4" />
                    Enviar Relatório
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sistema" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>
                  Personalize sua experiência no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-medium">Tema do Sistema</h3>
                      <p className="text-xs text-gray-500">
                        Alterne entre os modos claro e escuro
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <Switch
                        checked={isDarkMode}
                        onCheckedChange={handleThemeToggle}
                      />
                      <Moon className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Preferências de Notificação */}
                  <div className="pt-6 border-t space-y-4">
                    <h1 className="text-sm font-medium">Preferências de Notificação</h1>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b">
                        <div>
                          <h3 className="text-sm font-medium">Novas mensagens</h3>
                          <p className="text-xs text-gray-500">Notificações para novas mensagens de contatos</p>
                        </div>
                        <Button variant="outline" size="sm" className="flex items-center">
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                          Ativado
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b">
                        <div>
                          <h3 className="text-sm font-medium">Mensagens internas</h3>
                          <p className="text-xs text-gray-500">Notificações para mensagens de outros usuários</p>
                        </div>
                        <Button variant="outline" size="sm" className="flex items-center">
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                          Ativado
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <h3 className="text-sm font-medium">Atualizações do sistema</h3>
                          <p className="text-xs text-gray-500">Notificações sobre atualizações e manutenções</p>
                        </div>
                        <Button variant="outline" size="sm" className="flex items-center">
                          <AlertCircle className="mr-2 h-4 w-4 text-gray-500" />
                          Desativado
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isAdminMaster && (
            <TabsContent value="planos" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Planos & Contratos</CardTitle>
                  <CardDescription>
                    Gerencie seus planos e serviços contratados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Plano Atual */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-purple-900">Plano Enterprise</h3>
                          <p className="text-sm text-purple-700 mt-1">Ativo até 31/12/2024</p>
                        </div>
                        <ShieldAlert className="h-6 w-6 text-purple-500" />
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-purple-700">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Suporte 24/7 Prioritário
                        </div>
                        <div className="flex items-center text-sm text-purple-700">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Usuários Ilimitados
                        </div>
                        <div className="flex items-center text-sm text-purple-700">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          API Personalizada
                        </div>
                      </div>
                    </div>

                    {/* Serviços Contratados */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Serviços Contratados</h3>
                      <div className="grid gap-4">
                        <div className="p-4 bg-white rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">WhatsApp Business API</h4>
                              <p className="text-sm text-gray-500">via Meta for Business</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Acessar Portal
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 bg-white rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Serviço de Automação</h4>
                              <p className="text-sm text-gray-500">Chatbot & Fluxos</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Configurar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Avisos de Renovação */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Avisos</h3>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-yellow-900">Renovação Próxima</h4>
                            <p className="text-sm text-yellow-700">
                              Seu plano será renovado automaticamente em 31/12/2024.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
