import { createContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'PASSENGER' | 'DRIVER';
  available: boolean;
  rating: number;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Inicialización ultra segura: solo lee si el string es JSON válido
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token') || null;
  });

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // Sincronizar estados al arrancar la app una sola vez
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser && storedUser !== "undefined") {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};