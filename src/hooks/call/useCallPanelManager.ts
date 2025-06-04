
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useConnectionManager } from '@/hooks/connection/useConnectionManager';
import { useCallState } from '@/hooks/call/useCallState';
import { useCallActions } from '@/hooks/call/useCallActions';
import { toast } from 'sonner';

export const useCallPanelManager = () => {
  console.log('DEBUG: useCallPanelManager starting...');
  
  console.log('DEBUG: Getting user from auth context...');
  const { user } = useAuth();
  console.log('DEBUG: User obtained:', user ? 'exists' : 'null');
  
  console.log('DEBUG: Getting connection manager...');
  const { 
    connections, 
    isConnecting, 
    isConnected, 
    connectToFiliale, 
    disconnectFromFiliale,
    fetchConnections
  } = useConnectionManager();
  console.log('DEBUG: Connection manager obtained, isConnected:', isConnected);
  
  console.log('DEBUG: Getting call state...');
  const callState = useCallState();
  console.log('DEBUG: Call state obtained, filialeId:', callState.filialeId);
  
  console.log('DEBUG: Creating call actions...');
  const callActions = useCallActions({
    filialeId: callState.filialeId,
    selectedPhoneNumber: callState.selectedPhoneNumber,
    selectedContact: callState.selectedContact,
    callDuration: callState.callDuration,
    callResult: callState.callResult,
    customerFromNav: callState.customerFromNav,
    selectedCampaign: callState.selectedCampaign,
    callOutcome: callState.callOutcome,
    callNotes: callState.callNotes,
    setCallDuration: callState.setCallDuration,
    setCallResult: callState.setCallResult,
    setCallNotes: callState.setCallNotes,
    setCallOutcome: callState.setCallOutcome,
    setSelectedPhoneNumber: callState.setSelectedPhoneNumber,
    setSelectedContact: callState.setSelectedContact,
    setSelectedContract: callState.setSelectedContract,
    setCustomerFromNav: callState.setCustomerFromNav,
    setContactIdFromNav: callState.setContactIdFromNav,
    setFilialeId: callState.setFilialeId,
    isConnected
  });
  console.log('DEBUG: Call actions created successfully');

  useEffect(() => {
    console.log('DEBUG: useEffect for isPanelReady triggered');
    callState.setIsPanelReady(isConnected && callState.isCallActive);
  }, [isConnected, callState.isCallActive, callState.setIsPanelReady]);

  const handleConnect = async () => {
    console.log('DEBUG: handleConnect called');
    if (callState.filialeId) {
      const filialeNameForConnection = user?.filiale ? user.filiale.toString() : undefined;
      const success = await connectToFiliale(callState.filialeId, filialeNameForConnection);
      if (success) {
        callState.setIsPanelReady(true);
      }
    } else {
      toast.error('Keine Filiale zugewiesen', {
        description: 'Bitte kontaktieren Sie Ihren Administrator, um eine Filiale zuzuweisen.'
      });
    }
  };

  const handleDisconnect = async () => {
    console.log('DEBUG: handleDisconnect called');
    await disconnectFromFiliale();
    callState.setIsPanelReady(false);
  };

  console.log('DEBUG: Preparing return object...');
  
  const returnObject = {
    // State values - ALL FROM callState
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
    
    // Connection state
    connections,
    isConnecting,
    isConnected,
    
    // Setter functions - ALL FROM callState
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
    
    // Action functions - ALL FROM callActions
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
  
  console.log('DEBUG: Return object prepared, returning...');
  return returnObject;
};
