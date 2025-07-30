import { useState, useEffect } from 'react';
import { connectionManager } from '@/lib/firestore/connectionManager';

export const useFirestoreConnection = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial connection status
    setIsConnected(connectionManager.getConnectionStatus());

    // Listen for connection changes
    const unsubscribe = connectionManager.addConnectionListener((connected) => {
      setIsConnected(connected);
      if (connected) {
        setLastError(null);
      } else {
        setLastError('Connection lost');
      }
    });

    return unsubscribe;
  }, []);

  return { isConnected, lastError };
};