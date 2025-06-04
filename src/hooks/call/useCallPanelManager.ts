
// Minimale Test-Version
export const useCallPanelManager = () => {
  console.log('DEBUG: useCallPanelManager MINIMAL VERSION LOADED');
  
  return {
    activeTab: "manual",
    selectedPhoneNumber: "",
    isConnected: false,
    setActiveTab: () => {},
    setSelectedPhoneNumber: () => {}
  };
};
