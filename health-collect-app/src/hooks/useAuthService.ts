
import { useState, useEffect } from 'react';
import { authenticateUser, saveUserToStorage, clearUserStorage } from '@/utils/database';
import { User } from '@/types/auth';

export const useAuthService = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (badgeNumber: string): Promise<boolean> => {
    try {
      // Validate badge number is 5 digits
      if (!/^\d{5}$/.test(badgeNumber)) {
        return false;
      }

      const badgeNum = parseInt(badgeNumber, 10);
      const userData = await authenticateUser(badgeNum);
      
      if (userData) {
        const user: User = {
          id: userData.cd_login_contato.toString(),
          name: userData.nm_nome.split(' ')[0], // Just the first name
          role: userData.cd_funcao,
          department: userData.cd_funcao,
          badge: userData.cd_cartao_ponto
        };
        
        setUser(user);
        saveUserToStorage(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    clearUserStorage();
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
};
