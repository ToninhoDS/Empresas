import { useState } from "react";
import { Link, useLocation } from "wouter";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, HelpCircle, BarChart3, MessageSquare, Home } from "lucide-react";

interface UserMenuProps {
  userName: string;
  userRole: string;
  userInitials: string;
}

export default function UserMenu({ userName, userRole, userInitials }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="relative">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 group-hover:ring-2 group-hover:ring-blue-200">
              <span className="text-white text-sm font-semibold">{userInitials}</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {userName}
            </p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 rounded-xl border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <DropdownMenuLabel className="px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">{userInitials}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <Link href="/">
          <DropdownMenuItem className="px-4 py-3 hover:bg-blue-50 cursor-pointer rounded-none">
            <Home className="h-4 w-4 mr-3 text-gray-500" />
            <span className="text-sm text-gray-700">Início</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/ai-dashboard">
          <DropdownMenuItem className="px-4 py-3 hover:bg-blue-50 cursor-pointer rounded-none">
            <BarChart3 className="h-4 w-4 mr-3 text-gray-500" />
            <span className="text-sm text-gray-700">Dashboard</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuItem 
          className="px-4 py-3 hover:bg-blue-50 cursor-pointer rounded-none"
          onClick={() => {
            setIsOpen(false); // Fecha o dropdown menu
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('openAIChat'));
            }, 100); // Pequeno delay para garantir que o dropdown fechou
          }}
        >
          <MessageSquare className="h-4 w-4 mr-3 text-gray-500" />
          <span className="text-sm text-gray-700">Falar com a IA</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="px-4 py-3 hover:bg-blue-50 cursor-pointer rounded-none">
          <User className="h-4 w-4 mr-3 text-gray-500" />
          <span className="text-sm text-gray-700">Meu Perfil</span>
        </DropdownMenuItem>
        
        <Link href="/settings">
          <DropdownMenuItem className="px-4 py-3 hover:bg-blue-50 cursor-pointer rounded-none">
            <Settings className="h-4 w-4 mr-3 text-gray-500" />
            <span className="text-sm text-gray-700">Configurações</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuItem className="px-4 py-3 hover:bg-blue-50 cursor-pointer rounded-none">
          <HelpCircle className="h-4 w-4 mr-3 text-gray-500" />
          <span className="text-sm text-gray-700">Ajuda</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="px-4 py-3 hover:bg-red-50 cursor-pointer rounded-b-xl text-red-600">
          <LogOut className="h-4 w-4 mr-3" />
          <span className="text-sm">Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}