
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useConnectionManager } from '@/hooks/connection/useConnectionManager';
import { useCallState } from '@/hooks/call/useCallState';
import { useCallActions } from '@/hooks/call/useCallActions';
import { toast } from 'sonner';

export const useCallPanelManager = () => {
  console.log('DEBUG: useCallPanelManager starting...');
  
  try {
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

    console.log('DEBUG: Creating call actions...');
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
    console.log('DEBUG: Call actions created successfully');

    useEffect(() => {
      console.log('DEBUG: useEffect for isPanelReady triggered');
      setIsPanelReady(isConnected && callState.isCallActive);
    }, [isConnected, callState.isCallActive, setIsPanelReady]);

    const handleConnect = async () => {
      console.log('DEBUG: handleConnect called');
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
      console.log('DEBUG: handleDisconnect called');
      await disconnectFromFiliale();
      setIsPanelReady(false);
    };

    console.log('DEBUG: Preparing return object...');
    const returnObject = {
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
    
    console.log('DEBUG: Return object prepared, returning...');
    return returnObject;
    
  } catch (error) {
    console.error('ERROR in useCallPanelManager:', error);
    throw error;
  }
};
