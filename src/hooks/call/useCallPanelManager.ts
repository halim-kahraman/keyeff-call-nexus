
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useConnectionManager } from '@/hooks/connection/useConnectionManager';
import { useCallState } from '@/hooks/call/useCallState';
import { useCallActions } from '@/hooks/call/useCallActions';
import { toast } from 'sonner';

export const useCallPanelManager = () => {
  console.log('useCallPanelManager: Hook starting');
  
  const { user } = useAuth();
  console.log('useCallPanelManager: User:', user);
  
  const { 
    connections, 
    isConnecting, 
    isConnected, 
    connectToFiliale, 
    disconnectFromFiliale,
    fetchConnections
  } = useConnectionManager();
  
  console.log('useCallPanelManager: Connection state:', { isConnecting, isConnected });
  
  const callState = useCallState();
  console.log('useCallPanelManager: Call state:', callState);
  
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

  console.log('useCallPanelManager: Call actions created');

  useEffect(() => {
    setIsPanelReady(isConnected && callState.isCallActive);
  }, [isConnected, callState.isCallActive, setIsPanelReady]);

  const handleConnect = async () => {
    console.log('useCallPanelManager: handleConnect called');
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
    console.log('useCallPanelManager: handleDisconnect called');
    await disconnectFromFiliale();
    setIsPanelReady(false);
  };

  console.log('useCallPanelManager: Returning hook data');

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
