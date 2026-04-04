import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface SharedUserData {
  city: string;
  monthlyIncome: number;
  monthlyRent: number;
  savings: number;
}

interface UserDataContextType extends SharedUserData {
  updateField: <K extends keyof SharedUserData>(key: K, value: SharedUserData[K]) => void;
  updateAll: (data: Partial<SharedUserData>) => void;
}

const defaults: SharedUserData = {
  city: 'bengaluru',
  monthlyIncome: 150000,
  monthlyRent: 30000,
  savings: 2000000,
};

const UserDataContext = createContext<UserDataContextType | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SharedUserData>(defaults);

  const updateField = useCallback(<K extends keyof SharedUserData>(key: K, value: SharedUserData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateAll = useCallback((partial: Partial<SharedUserData>) => {
    setData(prev => ({ ...prev, ...partial }));
  }, []);

  return (
    <UserDataContext.Provider value={{ ...data, updateField, updateAll }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider');
  return ctx;
}
