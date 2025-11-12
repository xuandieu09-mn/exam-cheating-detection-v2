import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AppState = {
  sessionId: string | null;
};

type AppStateCtx = {
  state: AppState;
  setSessionId: (id: string | null) => void;
};

const Ctx = createContext<AppStateCtx | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem('currentSessionId'));

  useEffect(() => {
    if (sessionId) localStorage.setItem('currentSessionId', sessionId);
    else localStorage.removeItem('currentSessionId');
  }, [sessionId]);

  const value = useMemo<AppStateCtx>(() => ({ state: { sessionId }, setSessionId }), [sessionId]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
