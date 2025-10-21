import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from '@/hooks/useAuth';
import { ChangePasswordModal } from '../modals/ChangePasswordModal';
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'supervisor' | 'agent'>('agent');
  const { user, showChangePasswordModal, setShowChangePasswordModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Get user role from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.cargo as 'admin' | 'supervisor' | 'agent');
    }
  }, []);

  // Efeito para verificar se o usuário está logado
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    }
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
        userRole={userRole}
      />
      <div className="flex-1 overflow-auto">
        <main className="p-6 h-full">
          {user && showChangePasswordModal && (
            <ChangePasswordModal
              isOpen={showChangePasswordModal}
              onClose={() => setShowChangePasswordModal(false)}
              userId={user.id}
              isFirstAccess={user.primeiro_acesso || user.reset_senha}
            />
          )}
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default DashboardLayout;
