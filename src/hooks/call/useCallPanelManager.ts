
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useConnectionManager } from '@/hooks/connection/useConnectionManager';
import { useCallState } from '@/hooks/call/useCallState';
import { useCallActions } from '@/hooks/call/useCallActions';
import { toast } from 'sonner';
import { CallPanelManagerReturn } from '@/types/callPanel';

export const useCallPanelManager = (): CallPanelManagerReturn => {
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

  // Initialize call actions with all required props
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
    // State properties
    filialeId,
    isCallActive: callState.isCallActive,
    isPanelReady,
    activeTab: callState.activeTab,
    selectedPhoneNumber,
    selectedContact,
    selectedContract: callState.selectedContract,
    callResult,
    callNotes,
    callOutcome,
    callDuration,
    isFilialSelectionOpen: callState.isFilialSelectionOpen,
    selectedFiliale: callState.selectedFiliale,
    selectedCampaign,
    customerFromNav,
    contactIdFromNav: callState.contactIdFromNav,
    isLoading: callState.isLoading,
    campaigns: callState.campaigns,
    customers: callState.customers,
    
    // Setter functions
    setFilialeId,
    setIsPanelReady,
    setActiveTab: callState.setActiveTab,
    setSelectedPhoneNumber,
    setSelectedContact,
    setSelectedContract,
    setCallResult,
    setCallNotes,
    setCallOutcome,
    setCallDuration,
    setIsFilialSelectionOpen: callState.setIsFilialSelectionOpen,
    setSelectedFiliale: callState.setSelectedFiliale,
    setSelectedCampaign: callState.setSelectedCampaign,
    setCustomerFromNav,
    setContactIdFromNav,
    
    // Connection state
    connections,
    isConnecting,
    isConnected,
    
    // Action functions
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
