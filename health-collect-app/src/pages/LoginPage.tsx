
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClipboardList } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { findUserByBadge } from '@/utils/database';

const LoginPage: React.FC = () => {
  const [badge, setBadge] = useState('');
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBadgeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBadge(value);
    
    // If badge is 5 digits, try to find the user
    if (value.length === 5 && /^\d{5}$/.test(value)) {
      try {
        const user = await findUserByBadge(parseInt(value, 10));
        if (user) {
          setUserName(user.nm_nome.split(' ')[0]); // Just the first name
        } else {
          setUserName(null);
        }
      } catch (error) {
        console.error("Error finding user:", error);
        setUserName(null);
      }
    } else {
      setUserName(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badge) {
      toast({
        title: "Erro",
        description: "Digite o número do crachá",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const success = await login(badge);
    setIsLoading(false);

    if (success) {
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso",
      });
      navigate('/');
    } else {
      toast({
        title: "Erro",
        description: "Crachá não encontrado",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-darker p-4">
      <Card className="w-full max-w-md p-6 bg-app-dark border-none">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-app-blue flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Health Collect</h1>
          <p className="text-gray-300 mt-1">Gerenciamento de Coletas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="badge" className="block text-sm font-medium text-gray-300">
              Número do Crachá (5 dígitos)
            </label>
            <Input
              id="badge"
              type="text"
              value={badge}
              onChange={handleBadgeChange}
              className="w-full bg-gray-800 text-white border-gray-700"
              placeholder="Digite o número do crachá"
              maxLength={5}
              autoComplete="off"
            />
          </div>

          {userName && (
            <div className="bg-app-blue bg-opacity-20 p-3 rounded-md text-center">
              <p className="text-white">Olá, <span className="font-bold">{userName}</span>!</p>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-app-blue hover:bg-blue-700 text-white py-2 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-300">
          <p>Exemplo: 12345, 54321, 67890, 98765, 13579, 24680</p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
