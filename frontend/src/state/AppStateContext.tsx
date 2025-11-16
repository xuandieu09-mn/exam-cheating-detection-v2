import React, { createContext, useContext, useState } from 'react';

interface ExamSession {
  id: string;
  examId: string;
  userId: string;
  startedAt: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
}

interface AppState {
  currentSession: ExamSession | null;
  setCurrentSession: (session: ExamSession | null) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<ExamSession | null>(null);

  return (
    <AppStateContext.Provider value={{ currentSession, setCurrentSession }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};
