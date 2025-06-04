
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useConnectionManager } from '@/hooks/useConnectionManager';
import { Connection } from '@/types/connection';
import { toast } from 'sonner';

export const useCallPanelManager = () => {
  const { id: callId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { 
    connections, 
    isConnecting, 
    isConnected, 
    connectToFiliale, 
    disconnectFromFiliale,
    fetchConnections
  } = useConnectionManager();
  
  // Basic state
  const [filialeId, setFilialeId] = useState<number | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isPanelReady, setIsPanelReady] = useState(false);
  
  // Call panel specific state
  const [activeTab, setActiveTab] = useState("manual");
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [callResult, setCallResult] = useState<any>(null);
  const [callNotes, setCallNotes] = useState("");
  const [callOutcome, setCallOutcome] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [isFilialSelectionOpen, setIsFilialSelectionOpen] = useState(false);
  const [selectedFiliale, setSelectedFiliale] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  
  // Data from navigation
  const [customerFromNav, setCustomerFromNav] = useState<any>(null);
  const [contactIdFromNav, setContactIdFromNav] = useState<string | null>(null);
  
  // Data loading state
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    if (user?.filiale_id) {
      setFilialeId(user.filiale_id);
      setSelectedFiliale(user.filiale?.toString() || null);
    }
  }, [user]);

  useEffect(() => {
    if (callId) {
      setIsCallActive(true);
    } else {
      setIsCallActive(false);
    }
  }, [callId]);

  useEffect(() => {
    setIsPanelReady(isConnected && isCallActive);
  }, [isConnected, isCallActive]);

  // Get customer data from navigation state
  useEffect(() => {
    const state = location.state as any;
    if (state?.customer) {
      setCustomerFromNav(state.customer);
      setContactIdFromNav(state.contactId || null);
      
      // Auto-fill phone number if available
      if (state.customer.contacts && state.customer.contacts.length > 0) {
        const primaryContact = state.customer.contacts.find((c: any) => c.is_primary) || state.customer.contacts[0];
        setSelectedPhoneNumber(primaryContact.phone || "");
        setSelectedContact(primaryContact);
      }
    }
  }, [location.state]);

  const handleConnect = async () => {
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
    await disconnectFromFiliale();
    setIsPanelReady(false);
  };

  const handleCallStart = () => {
    if (filialeId && isConnected) {
      console.log('Starting call...', { selectedPhoneNumber, selectedContact });
      setCallDuration(0);
      setCallResult(null);
      // Start call timer
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      setCallResult({ timer });
    } else {
      toast.error('Anruf konnte nicht gestartet werden', {
        description: 'Bitte stellen Sie sicher, dass Sie mit einer Filiale verbunden sind.'
      });
    }
  };

  const handleCallEnd = (duration?: number) => {
    if (callResult?.timer) {
      clearInterval(callResult.timer);
    }
    if (duration !== undefined) {
      setCallDuration(duration);
    }
    setCallResult({ ended: true, duration: duration || callDuration });
  };

  const handleFilialeSelected = (branchId: string) => {
    setSelectedFiliale(branchId);
    setFilialeId(parseInt(branchId));
    navigate(`/call/${branchId}`);
  };

  const clearCustomerSelection = () => {
    setCustomerFromNav(null);
    setContactIdFromNav(null);
    setSelectedContact(null);
    setSelectedContract(null);
    setSelectedPhoneNumber("");
  };

  const handleSaveCallLog = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/calls/log.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_id: customerFromNav?.id,
          contact_id: selectedContact?.id,
          phone_number: selectedPhoneNumber,
          duration: callDuration,
          outcome: callOutcome,
          notes: callNotes,
          campaign_id: selectedCampaign
        })
      });
      
      toast.success('Anruf-Log gespeichert');
      
      // Reset form
      setCallNotes("");
      setCallOutcome("");
      setCallDuration(0);
      setCallResult(null);
      
    } catch (error) {
      toast.error('Fehler beim Speichern des Anruf-Logs');
    }
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
    connections,
    isConnecting,
    isConnected,
    campaigns,
    customers,
    isLoading,
    filialeId,
    isCallActive,
    isPanelReady,
    
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
    fetchConnections
  };
};
