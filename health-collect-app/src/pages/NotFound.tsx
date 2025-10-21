
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-app-darker text-white">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl text-gray-400 mb-6">Página não encontrada</p>
      <Button asChild className="bg-app-blue hover:bg-blue-700">
        <Link to="/">Voltar ao Início</Link>
      </Button>
    </div>
  );
};

export default NotFound;
