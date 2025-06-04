
export const useCallPanelManager = () => {
  console.log('DEBUG: useCallPanelManager EXTENDED VERSION LOADED');
  
  return {
    // State
    activeTab: "manual",
    selectedPhoneNumber: "",
    selectedContact: null,
    selectedContract: null,
    callResult: null,
    callNotes: "",
    callOutcome: "",
    callDuration: 0,
    isFilialSelectionOpen: false,
    selectedFiliale: null,
    selectedCampaign: null,
    customerFromNav: null,
    contactIdFromNav: null,
    connections: [],
    isConnecting: false,
    isConnected: false,
    campaigns: [],
    customers: [],
    isLoading: false,
    
    // Setters
    setActiveTab: () => {},
    setSelectedPhoneNumber: () => {},
    setSelectedContact: () => {},
    setSelectedContract: () => {},
    setCallNotes: () => {},
    setCallOutcome: () => {},
    setIsFilialSelectionOpen: () => {},
    setSelectedCampaign: () => {},
    
    // Handlers
    handleFilialeSelected: () => {},
    clearCustomerSelection: () => {},
    handleCallStart: () => {},
    handleCallEnd: () => {},
    handleSaveCallLog: async () => {},
    formatCallDuration: (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
    handleConnect: async () => {},
    handleDisconnect: async () => {}
  };
};
