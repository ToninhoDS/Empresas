
import React from 'react';
import NavBar from './NavBar';
import { Toaster } from "@/components/ui/toaster";
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Get page title based on current route
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/':
        return 'O.S. Manu';
      case '/coletas':
        return 'O.S.';
      case '/profile':
        return 'Perfil';
      case '/stats':
        return 'Stats';
      default:
        return '';
    }
  };
  
  const pageTitle = getPageTitle();
  
  // Only show title banner on pages that need it
  const showBanner = pageTitle !== '';
  
  return (
    <div className="min-h-screen flex flex-col bg-app-darker text-white">
      {showBanner && (
        <header className="bg-app-blue py-6 flex items-center justify-center">
          <h1 className="text-xl font-bold text-white text-center">{pageTitle}</h1>
        </header>
      )}
      <main className="flex-1 pb-16 overflow-y-auto">
        {children}
      </main>
      <NavBar />
      <Toaster />
    </div>
  );
};

export default Layout;
