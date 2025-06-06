
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { connectionService } from '@/services/api';

export interface Connection {
  id: string;
  filiale_id: number;
  filiale_name: string;
  connection_type: 'vpn' | 'sip' | 'webrtc';
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  started_at: string;
}

interface ConnectionData {
  vpn?: { server: string; username: string; };
  sip?: { server: string; username: string; password: string; };
  webrtc?: { iceServers: any[]; };
}

export const useConnectionService = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchConnections = async () => {
    try {
      const response = await connectionService.getConnections();
      if (response.success) {
        setConnections(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const startConnection = async (filialeId: number, type: string, connectionData: ConnectionData) => {
    try {
      const result = await connectionService.startConnection(filialeId.toString(), type, connectionData);
      
      setTimeout(async () => {
        await updateConnectionStatus(result.session_id, 'connected');
      }, 1000 + Math.random() * 2000);
      
      return result;
    } catch (error) {
      throw new Error(`Failed to start ${type} connection`);
    }
  };

  const updateConnectionStatus = async (sessionId: string, status: string) => {
    try {
      await connectionService.updateConnection(sessionId, status);
      await fetchConnections();
    } catch (error) {
      console.error('Error updating connection status:', error);
    }
  };

  const disconnectAll = async () => {
    try {
      for (const connection of connections) {
        if (connection.status === 'connected') {
          await connectionService.endConnection(connection.id);
        }
      }
      
      setConnections([]);
      
    } catch (error) {
      console.error('Error disconnecting:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return {
    connections,
    isConnecting,
    setIsConnecting,
    fetchConnections,
    startConnection,
    updateConnectionStatus,
    disconnectAll
  };
};
