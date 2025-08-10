import React, { createContext, useContext } from 'react';
import type { StorageAdapter } from '../adapters/StorageAdapter';
import { MockStorageAdapter } from '../adapters/MockStorageAdapter';

const StorageContext = createContext<StorageAdapter | null>(null);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always use the mock adapter by default. In the future this could be swapped
  // out based on environment variables.
  const adapter: StorageAdapter = new MockStorageAdapter();
  return <StorageContext.Provider value={adapter}>{children}</StorageContext.Provider>;
};

export function useStorage(): StorageAdapter {
  const ctx = useContext(StorageContext);
  if (!ctx) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return ctx;
}
