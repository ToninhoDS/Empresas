
export interface User {
  id: string;
  name: string;
  role: string;
  department: string;
  badge?: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (badgeNumber: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}
