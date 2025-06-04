import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useConnectionManager } from '@/hooks/useConnectionManager';
import { Connection } from '@/types/connection';
import { toast } from 'sonner';

export const useCallPanelManager = () => {
  const { id: callId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    connections, 
    isConnecting, 
    isConnected, 
    connectToFiliale, 
    disconnectFromFiliale,
    fetchConnections
  } = useConnectionManager();
  
  const [filialeId, setFilialeId] = useState<number | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isPanelReady, setIsPanelReady] = useState(false);

  useEffect(() => {
    if (user?.filiale_id) {
      setFilialeId(user.filiale_id);
    }
  }, [user]);

  useEffect(() => {
    if (callId) {
      setIsCallActive(true);
    } else {
      setIsCallActive(false);
    }
  }, [callId]);

  useEffect(() => {
    setIsPanelReady(isConnected && isCallActive);
  }, [isConnected, isCallActive]);

  const handleConnect = async () => {
    if (filialeId) {
      const success = await connectToFiliale(filialeId, user?.filiale);
      if (success) {
        setIsPanelReady(true);
      }
    } else {
      toast.error('Keine Filiale zugewiesen', {
        description: 'Bitte kontaktieren Sie Ihren Administrator, um eine Filiale zuzuweisen.'
      });
    }
  };

  const handleDisconnect = async () => {
    await disconnectFromFiliale();
    setIsPanelReady(false);
  };

  const handleCallStart = () => {
    if (filialeId) {
      navigate(`/call/${filialeId}`);
      setIsCallActive(true);
    } else {
      toast.error('Anruf konnte nicht gestartet werden', {
        description: 'Bitte stellen Sie sicher, dass Sie mit einer Filiale verbunden sind.'
      });
    }
  };

  const handleCallEnd = () => {
    navigate('/dashboard');
    setIsCallActive(false);
  };

  return {
    filialeId,
    isCallActive,
    isPanelReady,
    connections,
    isConnecting,
    isConnected,
    handleConnect,
    handleDisconnect,
    handleCallStart,
    handleCallEnd,
    fetchConnections
  };
};
