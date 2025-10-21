
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  LogOut, User, Settings, ChevronRight, 
  Bell, BellOff, Info 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [aboutAppOpen, setAboutAppOpen] = useState(false);
  const [department, setDepartment] = useState(user?.department || 'Manutenção');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    toast({
      title: "Desconectado",
      description: "Sessão encerrada com sucesso"
    });
    logout();
    navigate('/login');
  };

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    toast({
      title: "Departamento alterado",
      description: `Departamento atualizado para ${value}`
    });
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast({
      title: notificationsEnabled ? "Notificações desativadas" : "Notificações ativadas",
      description: notificationsEnabled 
        ? "Você não receberá mais notificações" 
        : "Você receberá notificações no celular"
    });
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Não autorizado</p>
      </div>
    );
  }

  return (
    <div className="pb-16 p-4">
      <Card className="bg-app-dark border-none mb-4">
        <div className="p-4 flex items-center">
          <div className="bg-app-blue w-16 h-16 rounded-full flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-gray-400">{user.role}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-app-dark border-none mb-4">
        <div className="p-4">
          <h3 className="flex items-center mb-4 text-lg font-medium">
            <Settings size={18} className="mr-2" />
            Configurações
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <div className="flex items-center">
                <span>Departamento</span>
              </div>
              <div className="flex items-center">
                <Select value={department} onValueChange={handleDepartmentChange}>
                  <SelectTrigger className="w-36 h-8 bg-transparent border-none text-gray-400">
                    <SelectValue placeholder="Departamento" />
                  </SelectTrigger>
                  <SelectContent className="bg-app-darker border-gray-700 text-white">
                    <SelectGroup>
                      <SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="Suporte">Suporte</SelectItem>
                      <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                      <SelectItem value="Adm Servidores">Adm Servidores</SelectItem>
                      <SelectItem value="TI Adm">TI Adm</SelectItem>
                      <SelectItem value="Bancada">Bancada</SelectItem>
                      <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                      <SelectItem value="Telefonia">Telefonia</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <ChevronRight size={18} className="ml-2 text-gray-500" />
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <div className="flex items-center">
                <span>Notificações</span>
              </div>
              <div className="flex items-center">
                <div className="flex items-center gap-2 mr-2">
                  {notificationsEnabled ? <Bell size={16} className="text-app-blue" /> : <BellOff size={16} className="text-gray-500" />}
                  <Switch 
                    checked={notificationsEnabled} 
                    onCheckedChange={toggleNotifications} 
                    className="data-[state=checked]:bg-app-blue"
                  />
                </div>
                <ChevronRight size={18} className="text-gray-500" />
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <div className="flex items-center">
                <span>Tema</span>
              </div>
              <div className="flex items-center text-gray-400">
                <span>Escuro</span>
                <ChevronRight size={18} className="ml-2" />
              </div>
            </div>

            <div onClick={() => setAboutAppOpen(true)} className="flex justify-between items-center py-2 cursor-pointer">
              <div className="flex items-center">
                <span>Sobre o App</span>
              </div>
              <div className="flex items-center">
                <ChevronRight size={18} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Button 
        className="w-full bg-red-600 hover:bg-red-700 text-white"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sair do Sistema
      </Button>
      
      <Dialog open={aboutAppOpen} onOpenChange={setAboutAppOpen}>
        <DialogContent className="bg-app-dark border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Sobre O.S. Manu</DialogTitle>
            <DialogDescription className="text-gray-400">
              Informações sobre o aplicativo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-app-blue bg-opacity-20 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center mb-4">
              <Info className="text-white h-12 w-12" />
            </div>
            
            <h3 className="font-bold text-lg text-center">O.S. Manu v1.0.0</h3>
            
            <p className="text-sm text-gray-300">
              Sistema de gerenciamento de ordens de serviço desenvolvido para otimizar o fluxo de trabalho da equipe técnica
              e melhorar a eficiência no atendimento de chamados.
            </p>
            
            <p className="text-sm text-gray-300">
              Desenvolvido utilizando React, TypeScript e Tailwind CSS. Utiliza componentização moderna
              para garantir performance e experiência do usuário aprimorada.
            </p>
            
            <p className="text-sm text-gray-400 text-center">
              © 2025 Todos os direitos reservados
            </p>
          </div>
          <DialogClose asChild>
            <Button className="w-full mt-2 bg-app-blue">Fechar</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
