import React, { createContext, useContext, useState, useEffect } from 'react';


interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  vendorId: number;
  companyName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Using navigate here would require it to be inside Router, so we pass it from App or components.
  // We'll manage state and let protected routes redirect.

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    // Auto-refresh token every 45 minutes (45 * 60 * 1000)
    const interval = setInterval(async () => {
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        try {
          // Import api here to avoid circular dependencies if any, or just use fetch
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.token) {
              const newToken = data.data.token;
              const newUser = data.data;
              setToken(newToken);
              setUser(newUser);
              localStorage.setItem('token', newToken);
              localStorage.setItem('user', JSON.stringify(newUser));
            }
          }
        } catch (error) {
          console.error('Failed to auto-refresh token', error);
        }
      }
    }, 45 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
