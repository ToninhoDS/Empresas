import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  BarChart, 
  MessageSquareText,
  Settings,
  Bell,
  UserCog,
  FolderKanban,
  LogOut,
  UserCheck,
  MessageSquareDashed,
  UserCircle,
  Search,
  PieChart,
  KanbanSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import { userService, UserProfile } from '@/services/userService';

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoutStats, setLogoutStats] = useState({
    unreadMessages: 0,
    pendingMessages: 0,
    internalMessages: 0,
    onlineUsers: 0
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const user = localStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          if (parsedUser && typeof parsedUser === 'object') {
            // Verificar se o objeto tem as propriedades mínimas necessárias
            if (parsedUser.id && parsedUser.nome && parsedUser.email && parsedUser.cargo) {
              setUserProfile(parsedUser);
            } else {
              console.error('Perfil do usuário inválido:', parsedUser);
              // Redirecionar para login se o perfil estiver inválido
              navigate('/login');
            }
          }
        } else {
          // Se não houver usuário no localStorage, redirecionar para login
          navigate('/login');
        }
      } catch (error) {
        console.error('Erro ao carregar perfil do usuário:', error);
        navigate('/login');
      }
    };

    loadUserProfile();

    // Simular estatísticas para o modal de logout
    setLogoutStats({
      unreadMessages: Math.floor(Math.random() * 20),
      pendingMessages: Math.floor(Math.random() * 15),
      internalMessages: Math.floor(Math.random() * 10),
      onlineUsers: Math.floor(Math.random() * 8) + 2
    });
  }, [navigate]);

  // Função para truncar o nome do departamento
  const truncateDepartmentName = (name: string) => {
    return name.length > 13 ? `${name.substring(0, 13)}...` : name;
  };

  // Define all navigation items
  const allNavItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', roles: ['agent'] },
    { name: 'Pipeline', icon: <KanbanSquare size={20} />, path: '/pipeline', roles: ['agent'] },
    { name: 'Mensagens', icon: <MessageSquare size={20} />, path: '/messages', roles: ['agent'] },
    { name: 'Contatos', icon: <Users size={20} />, path: '/contacts', roles: ['agent'] },
    { name: 'Mensagens Prontas', icon: <MessageSquareText size={20} />, path: '/predefined-messages', roles: ['agent'] },
    { name: 'Usuários', icon: <UserCog size={20} />, path: '/users', roles: ['admin'] },
    { name: 'Departamentos', icon: <FolderKanban size={20} />, path: '/departments', roles: ['admin'] },
    { name: 'Consulta Avançada', icon: <Search size={20} />, path: '/advanced-search', roles: ['supervisor'] },
    { name: 'Supervisão', icon: <UserCheck size={20} />, path: '/team-supervision', roles: ['supervisor'] },
    { name: 'Chat Interno', icon: <Bell size={20} />, path: '/internal-chat', roles: ['agent'] },
    { name: 'Configurações', icon: <Settings size={20} />, path: '/settings', roles: ['agent'] }
  ];

  // Filter navigation items based on user permissions
  const getNavItems = () => {
    if (!userProfile) return [];
    
    return allNavItems.filter(item => 
      userService.hasPermission(item.roles)
    );
  };

  const navItems = getNavItems();

  // Display role in user profile
  const getDisplayRole = () => {
    if (!userProfile?.cargo) return '';
    if (userProfile.isAdminMaster) return 'Admin-Master';
    return userProfile.cargo.charAt(0).toUpperCase() + userProfile.cargo.slice(1);
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!userProfile?.nome) return '';
    return userProfile.nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Função para determinar o título do sistema
  const getSystemTitle = () => {
    if (userProfile && userProfile.isAdminMaster) {
      return 'WApp Admin';
    }
    return `WApp ${truncateDepartmentName(userProfile?.departamentos?.[0]?.departamento?.nome || '')}`;
  };

  // Função para determinar o tooltip do sistema
  const getSystemTooltip = () => {
    if (userProfile && userProfile.isAdminMaster) {
      return 'WApp Admin-Master';
    }
    return `WApp ${truncateDepartmentName(userProfile?.departamentos?.[0]?.departamento?.nome || '')}`;
  };

  return (
    <aside 
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        {!collapsed && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h1 
                  className="text-xl font-bold text-whatsapp cursor-pointer hover:text-whatsapp/80 transition-colors"
                  onClick={() => navigate('/')}
                >
                  {getSystemTitle()}
                </h1>
              </TooltipTrigger>
              <TooltipContent>
                {getSystemTooltip()}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <nav className="mt-6 flex flex-col gap-2 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center px-4 py-3 rounded-md transition-colors",
                isActive
                  ? "bg-whatsapp text-white"
                  : "text-gray-700 hover:bg-gray-100",
                collapsed && "justify-center"
              )
            }
          >
            {collapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex-shrink-0">{item.icon}</span>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <>
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="ml-3">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <Button
          variant="ghost"
          className={cn(
            "flex items-center w-full px-4 py-3 text-red-600 hover:bg-gray-100",
            collapsed && "justify-center"
          )}
          onClick={() => setShowLogoutDialog(true)}
        >
          {collapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex-shrink-0"><LogOut size={20} /></span>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Sair
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              <span className="flex-shrink-0"><LogOut size={20} /></span>
              <span className="ml-3">Sair</span>
            </>
          )}
        </Button>

        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Saída</DialogTitle>
              <DialogDescription>
                Você tem certeza que deseja sair do sistema?
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-blue-700">Não Lidas</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-blue-700">{logoutStats.unreadMessages}</p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MessageSquareDashed className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium text-yellow-700">Aguardando</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-yellow-700">{logoutStats.pendingMessages}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-purple-500" />
                  <span className="font-medium text-purple-700">Chat Interno</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-purple-700">{logoutStats.internalMessages}</p>
              </div>

              {(userProfile && (userProfile.cargo === 'admin' || userProfile.cargo === 'supervisor')) && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <UserCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-700">Online</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-green-700">{logoutStats.onlineUsers}</p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowLogoutDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
              >
                Sim, Sair do Sistema
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-4 border-t border-gray-200">
        {!collapsed && userProfile && (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-whatsapp-light flex items-center justify-center text-white font-semibold">
              {getInitials()}
            </div>
            <div className="ml-3">
              <p className="font-medium text-sm">
                {getDisplayRole()}
              </p>
              <p className="text-xs text-gray-500">{userProfile.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
