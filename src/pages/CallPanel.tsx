import { AppLayout } from "@/components/layout/AppLayout";
import { BranchSelectionDialog } from "@/components/dialogs/BranchSelectionDialog";
import { ConnectionStatusCard } from "@/components/call/ConnectionStatusCard";
import { CallControlPanel } from "@/components/call/CallControlPanel";
import { CallResultPanel } from "@/components/call/CallResultPanel";
import { PhoneInterface } from "@/components/call/PhoneInterface";
import { WarningCard } from "@/components/call/WarningCard";
import { useCallPanelManager } from "@/hooks/call/useCallPanelManager";

const CallPanel = () => {
  const {
    // State
    activeTab,
    selectedPhoneNumber,
    selectedContact,
    selectedContract,
    callResult,
    callNotes,
    callOutcome,
    callDuration,
    isFilialSelectionOpen,
    selectedFiliale,
    selectedCampaign,
    customerFromNav,
    contactIdFromNav,
    connections,
    isConnecting,
    isConnected,
    campaigns,
    customers,
    isLoading,
    
    // Setters
    setActiveTab,
    setSelectedPhoneNumber,
    setSelectedContact,
    setSelectedContract,
    setCallNotes,
    setCallOutcome,
    setIsFilialSelectionOpen,
    setSelectedCampaign,
    
    // Handlers
    handleFilialeSelected,
    clearCustomerSelection,
    handleCallStart,
    handleCallEnd,
    handleSaveCallLog,
    formatCallDuration,
    handleConnect,
    handleDisconnect,
  } = useCallPanelManager();

  if (isLoading) {
    return (
      <AppLayout title="Anrufe" subtitle="Telefonzentrale">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Anrufe" subtitle="Telefonzentrale">
      {/* Connection Status Bar */}
      <div className="mb-6">
        <ConnectionStatusCard
          isConnected={isConnected}
          isConnecting={isConnecting}
          selectedFiliale={selectedFiliale}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      </div>

      {/* Warning if not connected */}
      <div className="mb-6">
        <WarningCard isConnected={isConnected} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Call Controls and Results */}
        <div className="space-y-6">
          <CallControlPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedPhoneNumber={selectedPhoneNumber}
            setSelectedPhoneNumber={setSelectedPhoneNumber}
            selectedContact={selectedContact}
            setSelectedContact={setSelectedContact}
            selectedContract={selectedContract}
            setSelectedContract={setSelectedContract}
            selectedCampaign={selectedCampaign}
            setSelectedCampaign={setSelectedCampaign}
            customerFromNav={customerFromNav}
            customers={customers}
            campaigns={campaigns}
            selectedFiliale={selectedFiliale}
            isConnected={isConnected}
            clearCustomerSelection={clearCustomerSelection}
          />
          
          <CallResultPanel
            callResult={callResult}
            callDuration={callDuration}
            callOutcome={callOutcome}
            setCallOutcome={setCallOutcome}
            callNotes={callNotes}
            setCallNotes={setCallNotes}
            onSaveCallLog={handleSaveCallLog}
            formatCallDuration={formatCallDuration}
          />
        </div>
        
        {/* Right Column - Phone Interface and Customer Info */}
        <div className="space-y-6">
          <PhoneInterface
            isConnected={isConnected}
            selectedPhoneNumber={selectedPhoneNumber}
            customerFromNav={customerFromNav}
            contactIdFromNav={contactIdFromNav}
            selectedCampaign={selectedCampaign}
            onCallStart={handleCallStart}
            onCallEnd={handleCallEnd}
          />
        </div>
      </div>

      <BranchSelectionDialog
        open={isFilialSelectionOpen}
        onOpenChange={setIsFilialSelectionOpen}
        onBranchSelected={handleFilialeSelected}
      />
    </AppLayout>
  );
};

export default CallPanel;
