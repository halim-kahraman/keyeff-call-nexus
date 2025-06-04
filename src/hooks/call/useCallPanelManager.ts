
export const useCallPanelManager = () => {
  console.log('DEBUG: useCallPanelManager - ULTRA MINIMAL VERSION');
  
  return {
    // Absolute minimum state
    isLoading: false,
    isConnected: false,
    activeTab: "manual",
    
    // Absolute minimum handlers (empty functions)
    setActiveTab: () => {},
    handleConnect: () => Promise.resolve(),
    handleDisconnect: () => Promise.resolve()
  };
};
