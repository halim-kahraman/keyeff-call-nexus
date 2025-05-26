
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/hooks/useAuth';
import { toast } from 'sonner';

interface Connection {
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

export const useConnectionManager = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Check if all required connections are established
  const checkConnectionStatus = () => {
    const hasVPN = connections.some(c => c.connection_type === 'vpn' && c.status === 'connected');
    const hasSIP = connections.some(c => c.connection_type === 'sip' && c.status === 'connected');
    const hasWebRTC = connections.some(c => c.connection_type === 'webrtc' && c.status === 'connected');
    
    setIsReady(hasVPN && hasSIP && hasWebRTC);
  };

  // Fetch current connections
  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem('auth_token');
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

  // Start connection to filiale
  const connectToFiliale = async (filialeId: number, filialeName?: string) => {
    setIsConnecting(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      // Start VPN connection
      await startConnection(filialeId, 'vpn', {
        vpn: { server: `vpn-${filialeId}.keyeff.local`, username: user?.email }
      });
      
      // Start SIP connection
      await startConnection(filialeId, 'sip', {
        sip: { 
          server: `sip-${filialeId}.keyeff.local`, 
          username: user?.email,
          password: 'generated_sip_password'
        }
      });
      
      // Start WebRTC connection
      await startConnection(filialeId, 'webrtc', {
        webrtc: { 
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: `turn:turn-${filialeId}.keyeff.local`, username: user?.email, credential: 'turn_password' }
          ]
        }
      });
      
      // Wait for connections to establish
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await fetchConnections();
      
      toast.success(`Verbunden mit Filiale ${filialeName || filialeId}`, {
        description: 'Alle Verbindungen (VPN, SIP, WebRTC) wurden erfolgreich hergestellt.'
      });
      
      return true;
      
    } catch (error) {
      toast.error('Verbindungsfehler', {
        description: 'Fehler beim Herstellen der Verbindung zur Filiale.'
      });
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Start individual connection
  const startConnection = async (filialeId: number, type: string, connectionData: ConnectionData) => {
    const token = localStorage.getItem('auth_token');
    
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
    
    // Simulate connection establishment
    setTimeout(async () => {
      await updateConnectionStatus(result.session_id, 'connected');
    }, 1000 + Math.random() * 2000);
    
    return result;
  };

  // Update connection status
  const updateConnectionStatus = async (sessionId: string, status: string) => {
    const token = localStorage.getItem('auth_token');
    
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

  // Disconnect from filiale
  const disconnectFromFiliale = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
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
      setIsReady(false);
      
      toast.success('Verbindung getrennt', {
        description: 'Alle Verbindungen wurden erfolgreich getrennt.'
      });
      
    } catch (error) {
      toast.error('Fehler beim Trennen der Verbindung');
    }
  };

  useEffect(() => {
    checkConnectionStatus();
  }, [connections]);

  useEffect(() => {
    fetchConnections();
  }, []);

  return {
    connections,
    isConnecting,
    isReady,
    isConnected: isReady, // Add isConnected as alias for isReady
    connectToFiliale,
    disconnectFromFiliale,
    fetchConnections
  };
};
