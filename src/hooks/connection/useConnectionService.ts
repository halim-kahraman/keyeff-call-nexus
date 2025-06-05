
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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
      const token = localStorage.getItem('token');
      const response = await fetch('/api/connections/manage.php', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConnections(data);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const startConnection = async (filialeId: number, type: string, connectionData: ConnectionData) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch('/api/connections/manage.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        filiale_id: filialeId,
        connection_type: type,
        connection_data: connectionData
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to start ${type} connection`);
    }
    
    const result = await response.json();
    
    setTimeout(async () => {
      await updateConnectionStatus(result.session_id, 'connected');
    }, 1000 + Math.random() * 2000);
    
    return result;
  };

  const updateConnectionStatus = async (sessionId: string, status: string) => {
    const token = localStorage.getItem('token');
    
    await fetch('/api/connections/manage.php', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        session_id: sessionId,
        status: status
      })
    });
    
    await fetchConnections();
  };

  const disconnectAll = async () => {
    try {
      const token = localStorage.getItem('token');
      
      for (const connection of connections) {
        if (connection.status === 'connected') {
          await fetch(`/api/connections/manage.php?session_id=${connection.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
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
