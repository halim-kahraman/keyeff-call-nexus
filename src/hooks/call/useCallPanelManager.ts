
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
    // State properties - ALL FROM CALLSTATE (ALLE FUNKTIONEN ERHALTEN)
    activeTab: callState.activeTab,
    selectedPhoneNumber: callState.selectedPhoneNumber,
    selectedContact: callState.selectedContact,
    selectedContract: callState.selectedContract,
    callResult: callState.callResult,
    callNotes: callState.callNotes,
    callOutcome: callState.callOutcome,
    callDuration: callState.callDuration,
    isFilialSelectionOpen: callState.isFilialSelectionOpen,
    selectedFiliale: callState.selectedFiliale,
    selectedCampaign: callState.selectedCampaign,
    customerFromNav: callState.customerFromNav,
    contactIdFromNav: callState.contactIdFromNav,
    isLoading: callState.isLoading,
    campaigns: callState.campaigns,
    customers: callState.customers,
    filialeId: callState.filialeId,
    isCallActive: callState.isCallActive,
    isPanelReady: callState.isPanelReady,
    
    // Setter functions - ALL FROM CALLSTATE (ALLE SETTER ERHALTEN)
    setActiveTab: callState.setActiveTab,
    setSelectedPhoneNumber: callState.setSelectedPhoneNumber,
    setSelectedContact: callState.setSelectedContact,
    setSelectedContract: callState.setSelectedContract,
    setCallResult: callState.setCallResult,
    setCallNotes: callState.setCallNotes,
    setCallOutcome: callState.setCallOutcome,
    setCallDuration: callState.setCallDuration,
    setIsFilialSelectionOpen: callState.setIsFilialSelectionOpen,
    setSelectedFiliale: callState.setSelectedFiliale,
    setSelectedCampaign: callState.setSelectedCampaign,
    setCustomerFromNav: callState.setCustomerFromNav,
    setContactIdFromNav: callState.setContactIdFromNav,
    setIsLoading: callState.setIsLoading,
    setCampaigns: callState.setCampaigns,
    setCustomers: callState.setCustomers,
    setFilialeId: callState.setFilialeId,
    setIsPanelReady: callState.setIsPanelReady,
    
    // Connection state (ALLE CONNECTION EIGENSCHAFTEN ERHALTEN)
    connections,
    isConnecting,
    isConnected,
    
    // Action functions (ALLE ACTION FUNKTIONEN ERHALTEN)
    handleCallStart: callActions.handleCallStart,
    handleCallEnd: callActions.handleCallEnd,
    handleFilialeSelected: callActions.handleFilialeSelected,
    clearCustomerSelection: callActions.clearCustomerSelection,
    handleSaveCallLog: callActions.handleSaveCallLog,
    formatCallDuration: callActions.formatCallDuration,
    
    // Connection handlers (ALLE CONNECTION HANDLER ERHALTEN)
    handleConnect,
    handleDisconnect,
    fetchConnections
  };
};
