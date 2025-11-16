import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'CANDIDATE' | 'PROCTOR' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    const mockUsers = {
      CANDIDATE: { 
        id: '22222222-2222-2222-2222-222222222222', 
        username: 'Nguyễn Văn A', 
        role: 'CANDIDATE' as UserRole 
      },
      PROCTOR: { 
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
        username: 'Trần Thị B', 
        role: 'PROCTOR' as UserRole 
      },
      ADMIN: { 
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
        username: 'Lê Văn C', 
        role: 'ADMIN' as UserRole 
      }
    };
    
    setUser(mockUsers[role]);
    localStorage.setItem('user', JSON.stringify(mockUsers[role]));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};