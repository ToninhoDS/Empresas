
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, BarChart2, User } from 'lucide-react';

const NavBar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-app-blue flex justify-around items-center px-4 z-10">
      <Link to="/" className={`flex flex-col items-center ${isActive("/") ? "text-white" : "text-gray-300"}`}>
        <Home size={20} />
        <span className="text-xs mt-1">Início</span>
      </Link>
      <Link to="/coletas" className={`flex flex-col items-center ${isActive("/coletas") ? "text-white" : "text-gray-300"}`}>
        <ClipboardList size={20} />
        <span className="text-xs mt-1">O.S.</span>
      </Link>
      <Link to="/stats" className={`flex flex-col items-center ${isActive("/stats") ? "text-white" : "text-gray-300"}`}>
        <BarChart2 size={20} />
        <span className="text-xs mt-1">Stats</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center ${isActive("/profile") ? "text-white" : "text-gray-300"}`}>
        <User size={20} />
        <span className="text-xs mt-1">Perfil</span>
      </Link>
    </div>
  );
};

export default NavBar;
