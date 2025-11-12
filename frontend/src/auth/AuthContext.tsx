import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type Role = 'STUDENT' | 'PROCTOR' | 'ADMIN';

type AuthState = {
  role: Role | null;
  displayName?: string;
  token?: string | null;
};

type AuthContextValue = {
  state: AuthState;
  loginAs: (role: Role, displayName?: string, token?: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    const raw = localStorage.getItem('auth');
    return raw ? JSON.parse(raw) : { role: null };
  });

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(state));
  }, [state]);

  const value = useMemo<AuthContextValue>(() => ({
    state,
    loginAs: (role, displayName, token) => {
      // If token has roles, prefer them to avoid mismatch
      let finalRole: Role | null = role || null;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1] || ''));
          const roles: string[] = payload?.roles || payload?.authorities || [];
          const normalized = roles.map((r: string) => r.replace(/^ROLE_/, '')) as string[];
          const priority: Role[] = ['ADMIN', 'PROCTOR', 'STUDENT'];
          const matched = priority.find(r => normalized.includes(r));
          if (matched) finalRole = matched;
        } catch {}
      }
      setState({ role: finalRole, displayName, token: token ?? null });
    },
    logout: () => setState({ role: null, token: null })
  }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export const RequireRole: React.FC<{ allow: Role; children: React.ReactNode }>=({ allow, children })=>{
  const { state } = useAuth();
  if (state.role !== allow) {
    return (
      <div style={{ padding: 24 }}>
        <h3>Không có quyền truy cập</h3>
        <p>Vui lòng đăng nhập với quyền phù hợp.</p>
        <a href="/login">Đi tới đăng nhập</a>
      </div>
    );
  }
  return <>{children}</>;
};
