
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { BranchSelectionDialog } from "@/components/dialogs/BranchSelectionDialog";
import { useQuery } from "@tanstack/react-query";
import { customerService, campaignService } from "@/services/api";
import { useConnectionManager } from "@/hooks/useConnectionManager";
import { ConnectionStatusCard } from "@/components/call/ConnectionStatusCard";
import { CallControlPanel } from "@/components/call/CallControlPanel";
import { CallResultPanel } from "@/components/call/CallResultPanel";
import { PhoneInterface } from "@/components/call/PhoneInterface";
import { WarningCard } from "@/components/call/WarningCard";

const CallPanel = () => {
  const [activeTab, setActiveTab] = useState("dialpad");
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [callResult, setCallResult] = useState<any>(null);
  const [callNotes, setCallNotes] = useState("");
  const [callOutcome, setCallOutcome] = useState("Erfolgreich");
  const [callDuration, setCallDuration] = useState(0);
  const [isFilialSelectionOpen, setIsFilialSelectionOpen] = useState(false);
  const [selectedFiliale, setSelectedFiliale] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  
  const location = useLocation();
  const { user } = useAuth();
  const { connections, isConnecting, isConnected, connectToFiliale, disconnectFromFiliale } = useConnectionManager();
  
  // Safely access navigation state
  const customerFromNav = location.state?.customer || null;
  const contactIdFromNav = location.state?.contactId || null;
  const campaignFromNav = location.state?.campaignId || null;
  
  // Determine if user needs to select filiale
  const needsFilialSelection = user?.role === 'admin' && !selectedFiliale;

  // Handle filiale selection and connection
  const handleFilialeSelected = async (filialeId: string) => {
    setSelectedFiliale(filialeId);
    setIsFilialSelectionOpen(false);
    
    // Start connection process
    toast.info("Verbindung wird hergestellt...", {
      description: "VPN, SIP und WebRTC werden initialisiert.",
    });
    
    try {
      await connectToFiliale(parseInt(filialeId), `Filiale ${filialeId}`);
      toast.success("Verbindung hergestellt", {
        description: "Erfolgreich mit Filiale verbunden.",
      });
    } catch (error) {
      toast.error("Verbindungsfehler", {
        description: "Fehler beim Herstellen der Verbindung zur Filiale.",
      });
    }
  };

  // Clear customer selection
  const clearCustomerSelection = () => {
    setSelectedContact(null);
    setSelectedContract(null);
    setSelectedPhoneNumber("");
  };

  // Handle call start - only allowed if connected
  const handleCallStart = () => {
    if (!isConnected) {
      toast.error("Keine Verbindung", {
        description: "Eine Verbindung zur Filiale muss hergestellt werden, bevor Anrufe getätigt werden können.",
      });
      return;
    }

    if (!selectedPhoneNumber) {
      toast.error("Keine Telefonnummer", {
        description: "Bitte geben Sie eine Telefonnummer ein.",
      });
      return;
    }

    console.log('Call started to:', selectedPhoneNumber);
    setCallResult(null);
    setCallDuration(0);
  };

  // Handle call end
  const handleCallEnd = (duration: number) => {
    console.log('Call ended with duration:', duration);
    setCallResult({
      duration: duration,
      timestamp: new Date().toISOString()
    });
    setCallDuration(duration);
  };

  // Save call log
  const handleSaveCallLog = async () => {
    try {
      const logData = {
        phone_number: selectedPhoneNumber,
        duration: callDuration,
        outcome: callOutcome,
        notes: callNotes,
        customer_id: customerFromNav?.id || null,
        campaign_id: selectedCampaign,
        filiale_id: selectedFiliale
      };

      // Save to backend
      const response = await fetch('/api/calls/log.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(logData)
      });

      if (response.ok) {
        toast.success("Anruf gespeichert", {
          description: "Der Anruf wurde erfolgreich protokolliert.",
        });
        
        // Reset form
        setCallResult(null);
        setCallNotes("");
        setCallDuration(0);
        setCallOutcome("Erfolgreich");
      } else {
        throw new Error('Failed to save call log');
      }
    } catch (error) {
      toast.error("Fehler", {
        description: "Der Anruf konnte nicht gespeichert werden.",
      });
    }
  };

  // Format time for timer display
  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle connection actions
  const handleConnect = () => {
    if (selectedFiliale) {
      connectToFiliale(parseInt(selectedFiliale), `Filiale ${selectedFiliale}`);
    }
  };

  const handleDisconnect = () => {
    disconnectFromFiliale();
  };
  
  // Fetch campaigns for the selected filiale
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns', selectedFiliale],
    queryFn: () => campaignService.getCampaigns(),
    enabled: !!selectedFiliale,
  });

  // Fetch customers based on the selected campaign
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', selectedFiliale, selectedCampaign],
    queryFn: () => customerService.getCustomers(selectedFiliale, selectedCampaign),
    enabled: !!selectedFiliale,
  });

  // Set default customer from navigation if available
  useEffect(() => {
    if (customerFromNav) {
      setActiveTab("customer");
      
      // If specific contact ID was passed, find it
      if (contactIdFromNav && Array.isArray(customerFromNav.contacts)) {
        const contact = customerFromNav.contacts.find((c: any) => c.id === contactIdFromNav);
        if (contact) {
          setSelectedContact(contact);
          setSelectedPhoneNumber(contact.phone || "");
        } else {
          // Default to first contact or primary phone
          const primaryPhones = customerFromNav.primary_phones?.split(',') || [];
          setSelectedPhoneNumber(primaryPhones[0] || "");
        }
      } else {
        // Default to first phone number
        const primaryPhones = customerFromNav.primary_phones?.split(',') || [];
        setSelectedPhoneNumber(primaryPhones[0] || "");
      }
      
      // Default to first contract
      if (Array.isArray(customerFromNav.contracts) && customerFromNav.contracts.length > 0) {
        setSelectedContract(customerFromNav.contracts[0]);
      }
    }
  }, [customerFromNav, contactIdFromNav]);
  
  // Set up filial selection if needed
  useEffect(() => {
    if (needsFilialSelection) {
      setIsFilialSelectionOpen(true);
    }
  }, [needsFilialSelection]);
  
  // Set campaign from navigation
  useEffect(() => {
    if (campaignFromNav) {
      setSelectedCampaign(campaignFromNav.toString());
    }
  }, [campaignFromNav]);

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
