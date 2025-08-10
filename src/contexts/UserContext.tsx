import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'owner' | 'employee';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

interface UserContextValue {
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const signIn = (u: User) => setUser(u);
  const signOut = () => setUser(null);
  return <UserContext.Provider value={{ user, signIn, signOut }}>{children}</UserContext.Provider>;
};

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
}
