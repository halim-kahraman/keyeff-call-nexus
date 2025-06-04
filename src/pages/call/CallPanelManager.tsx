
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { customerService, campaignService } from "@/services/api";
import { useConnectionManager } from "@/hooks/useConnectionManager";

export const useCallPanelManager = () => {
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
  
  const customerFromNav = location.state?.customer || null;
  const contactIdFromNav = location.state?.contactId || null;
  const campaignFromNav = location.state?.campaignId || null;
  
  const needsFilialSelection = user?.role === 'admin' && !selectedFiliale;

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns', selectedFiliale],
    queryFn: () => campaignService.getCampaigns(),
    enabled: !!selectedFiliale,
  });

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', selectedFiliale, selectedCampaign],
    queryFn: () => customerService.getCustomers(selectedFiliale, selectedCampaign),
    enabled: !!selectedFiliale,
  });

  const handleFilialeSelected = async (filialeId: string) => {
    setSelectedFiliale(filialeId);
    setIsFilialSelectionOpen(false);
    
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

  const clearCustomerSelection = () => {
    setSelectedContact(null);
    setSelectedContract(null);
    setSelectedPhoneNumber("");
  };

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

  const handleCallEnd = (duration: number) => {
    console.log('Call ended with duration:', duration);
    setCallResult({
      duration: duration,
      timestamp: new Date().toISOString()
    });
    setCallDuration(duration);
  };

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

      const response = await fetch('/api/calls/log.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(logData)
      });

      if (response.ok) {
        toast.success("Anruf gespeichert", {
          description: "Der Anruf wurde erfolgreich protokolliert.",
        });
        
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

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConnect = () => {
    if (selectedFiliale) {
      connectToFiliale(parseInt(selectedFiliale), `Filiale ${selectedFiliale}`);
    }
  };

  const handleDisconnect = () => {
    disconnectFromFiliale();
  };

  useEffect(() => {
    if (customerFromNav) {
      setActiveTab("customer");
      
      if (contactIdFromNav && Array.isArray(customerFromNav.contacts)) {
        const contact = customerFromNav.contacts.find((c: any) => c.id === contactIdFromNav);
        if (contact) {
          setSelectedContact(contact);
          setSelectedPhoneNumber(contact.phone || "");
        } else {
          const primaryPhones = customerFromNav.primary_phones?.split(',') || [];
          setSelectedPhoneNumber(primaryPhones[0] || "");
        }
      } else {
        const primaryPhones = customerFromNav.primary_phones?.split(',') || [];
        setSelectedPhoneNumber(primaryPhones[0] || "");
      }
      
      if (Array.isArray(customerFromNav.contracts) && customerFromNav.contracts.length > 0) {
        setSelectedContract(customerFromNav.contracts[0]);
      }
    }
  }, [customerFromNav, contactIdFromNav]);
  
  useEffect(() => {
    if (needsFilialSelection) {
      setIsFilialSelectionOpen(true);
    }
  }, [needsFilialSelection]);
  
  useEffect(() => {
    if (campaignFromNav) {
      setSelectedCampaign(campaignFromNav.toString());
    }
  }, [campaignFromNav]);

  return {
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
    needsFilialSelection,
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
  };
};
