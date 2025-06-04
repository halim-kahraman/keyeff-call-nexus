
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useConnectionManager } from '@/hooks/connection/useConnectionManager';
import { useCallState } from '@/hooks/call/useCallState';
import { useCallActions } from '@/hooks/call/useCallActions';
import { toast } from 'sonner';

export const useCallPanelManager = () => {
  const { user } = useAuth();
  const { 
    connections, 
    isConnecting, 
    isConnected, 
    connectToFiliale, 
    disconnectFromFiliale,
    fetchConnections
  } = useConnectionManager();
  
  const callState = useCallState();
  const {
    filialeId,
    isPanelReady,
    setIsPanelReady,
    ...restState
  } = callState;

  const callActions = useCallActions({
    ...callState,
    isConnected
  });

  useEffect(() => {
    setIsPanelReady(isConnected && callState.isCallActive);
  }, [isConnected, callState.isCallActive, setIsPanelReady]);

  const handleConnect = async () => {
    if (filialeId) {
      const filialeNameForConnection = user?.filiale ? user.filiale.toString() : undefined;
      const success = await connectToFiliale(filialeId, filialeNameForConnection);
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

  return {
    // State from useCallState
    ...restState,
    filialeId,
    isPanelReady,
    
    // Connection state
    connections,
    isConnecting,
    isConnected,
    
    // Actions from useCallActions
    ...callActions,
    
    // Connection handlers
    handleConnect,
    handleDisconnect,
    fetchConnections
  };
};
