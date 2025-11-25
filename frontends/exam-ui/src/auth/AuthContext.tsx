
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiClient } from '../api/client';
import axios from 'axios';

export type UserRole = 'CANDIDATE' | 'PROCTOR' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithCredentials: (username: string, password: string) => Promise<void>;
  loginWithOAuth2: () => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  setUserFromProfile?: (profile: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper để convert roles từ JWT thành UserRole
const getUserRoleFromRoles = (roles?: string[] | null): UserRole => {
  const r = roles ?? [];
  if (r.includes('ROLE_ADMIN') || r.includes('ADMIN')) return 'ADMIN';
  if (r.includes('ROLE_PROCTOR') || r.includes('PROCTOR')) return 'PROCTOR';
  return 'CANDIDATE';
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);


  // Load user từ session (BFF) khi component mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // Fetch user info from BFF (uses HttpOnly cookie)
        const response = await axios.get('/api/auth/userinfo');
        const profile = response.data;

        if (profile && isMounted) {
          const roles = profile.roles ?? [];
          const userData: User = {
            id: profile.sub,
            username: profile.username || profile.preferred_username || profile.email,
            email: profile.email,
            fullName: profile.fullName || profile.name,
            role: getUserRoleFromRoles(roles),
            roles,
          };
          setUser(userData);
        }
      } catch (error) {
        // 401 means not logged in, which is fine.
        // Network errors (backend down) are also possible on init.
        // We just treat this as "not authenticated".
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const setUserFromProfile = (profile: any) => {
    if (!profile) return;
    try {
      const roles = profile.roles ?? [];
      const userData: User = {
        id: profile.sub,
        username: profile.username || profile.preferred_username || profile.email,
        email: profile.email,
        fullName: profile.fullName || profile.name,
        role: getUserRoleFromRoles(roles),
        roles,
      };
      setUser(userData);
    } catch (err) {
      console.error('Failed to set user from profile:', err);
    }
  };

  const loginWithCredentials = async (username: string, password: string) => {
    // Legacy method - redirect to OAuth2 login instead
    loginWithOAuth2();
  };

  const loginWithOAuth2 = () => {
    apiClient.login();
  };

  const logout = async () => {
    try {
      // Clear user state immediately
      setUser(null);

      // Call BFF logout endpoint (which will redirect to signout page)
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to login
      window.location.href = '/login';
    }
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithCredentials,
        loginWithOAuth2,
        logout,
        isAuthenticated,
        setUserFromProfile
      }}
    >
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
