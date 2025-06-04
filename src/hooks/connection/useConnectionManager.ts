
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useConnectionService, Connection } from './useConnectionService';

interface ConnectionData {
  vpn?: { server: string; username: string; };
  sip?: { server: string; username: string; password: string; };
  webrtc?: { iceServers: any[]; };
}

export const useConnectionManager = () => {
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const { 
    connections, 
    isConnecting, 
    setIsConnecting,
    fetchConnections,
    startConnection,
    disconnectAll 
  } = useConnectionService();

  const checkConnectionStatus = () => {
    const hasVPN = connections.some(c => c.connection_type === 'vpn' && c.status === 'connected');
    const hasSIP = connections.some(c => c.connection_type === 'sip' && c.status === 'connected');
    const hasWebRTC = connections.some(c => c.connection_type === 'webrtc' && c.status === 'connected');
    
    setIsReady(hasVPN && hasSIP && hasWebRTC);
  };

  const connectToFiliale = async (filialeId: number, filialeName?: string) => {
    setIsConnecting(true);
    
    try {
      await startConnection(filialeId, 'vpn', {
        vpn: { server: `vpn-${filialeId}.keyeff.local`, username: user?.email || 'unknown' }
      });
      
      await startConnection(filialeId, 'sip', {
        sip: { 
          server: `sip-${filialeId}.keyeff.local`, 
          username: user?.email || 'unknown',
          password: 'generated_sip_password'
        }
      });
      
      await startConnection(filialeId, 'webrtc', {
        webrtc: { 
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: `turn:turn-${filialeId}.keyeff.local`, username: user?.email || 'unknown', credential: 'turn_password' }
          ]
        }
      });
      
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

  const disconnectFromFiliale = async () => {
    try {
      await disconnectAll();
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

  return {
    connections,
    isConnecting,
    isReady,
    isConnected: isReady,
    connectToFiliale,
    disconnectFromFiliale,
    fetchConnections
  };
};
