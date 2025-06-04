
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
    selectedPhoneNumber,
    selectedContact,
    callDuration,
    callResult,
    customerFromNav,
    selectedCampaign,
    callOutcome,
    callNotes,
    setCallDuration,
    setCallResult,
    setCallNotes,
    setCallOutcome,
    setSelectedPhoneNumber,
    setSelectedContact,
    setSelectedContract,
    setCustomerFromNav,
    setContactIdFromNav,
    setFilialeId
  } = callState;

  const callActions = useCallActions({
    filialeId,
    selectedPhoneNumber,
    selectedContact,
    callDuration,
    callResult,
    customerFromNav,
    selectedCampaign,
    callOutcome,
    callNotes,
    setCallDuration,
    setCallResult,
    setCallNotes,
    setCallOutcome,
    setSelectedPhoneNumber,
    setSelectedContact,
    setSelectedContract,
    setCustomerFromNav,
    setContactIdFromNav,
    setFilialeId,
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
    // All state from useCallState
    ...callState,
    
    // Connection state
    connections,
    isConnecting,
    isConnected,
    
    // Actions from useCallActions (destructured to avoid conflicts)
    handleCallStart: callActions.handleCallStart,
    handleCallEnd: callActions.handleCallEnd,
    handleFilialeSelected: callActions.handleFilialeSelected,
    clearCustomerSelection: callActions.clearCustomerSelection,
    handleSaveCallLog: callActions.handleSaveCallLog,
    formatCallDuration: callActions.formatCallDuration,
    
    // Connection handlers
    handleConnect,
    handleDisconnect,
    fetchConnections
  };
};
