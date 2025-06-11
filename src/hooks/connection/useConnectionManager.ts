import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ConnectionStatus {
  isConnected: boolean;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastChecked: Date | null;
  error?: string;
}

export const useConnectionManager = () => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    status: 'disconnected',
    lastChecked: null
  });

  useEffect(() => {
    if (user) {
      // Initialize connection status check
      checkConnection();
    }
  }, [user]);

  const checkConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, status: 'connecting' }));
    
    try {
      // Simulate connection check
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConnectionStatus({
        isConnected: true,
        status: 'connected',
        lastChecked: new Date()
      });
    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        status: 'error',
        lastChecked: new Date(),
        error: 'Connection failed'
      });
      toast.error('Verbindung fehlgeschlagen');
    }
  };

  return {
    connectionStatus,
    checkConnection
  };
};
