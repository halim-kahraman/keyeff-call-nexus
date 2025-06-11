
import { useState } from 'react';

interface Filiale {
  id: string;
  name: string;
  [key: string]: any;
}

export const useCallPanelManager = () => {
  // State
  const [activeTab, setActiveTab] = useState('manual');
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [callResult, setCallResult] = useState<{ startTime: number; status: string; endTime?: number } | null>(null);
  const [callNotes, setCallNotes] = useState('');
  const [callOutcome, setCallOutcome] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isFilialSelectionOpen, setIsFilialSelectionOpen] = useState(false);
  const [selectedFiliale, setSelectedFiliale] = useState<Filiale | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [customerFromNav, setCustomerFromNav] = useState(null);
  const [contactIdFromNav, setContactIdFromNav] = useState(null);
  const [connections, setConnections] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Data state - mock data only
  const [campaigns, setCampaigns] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock user
  const user = { id: '1', name: 'Test User' };

  // Handlers
  const handleFilialeSelected = (filiale: any) => {
    setSelectedFiliale(filiale);
    setIsFilialSelectionOpen(false);
  };

  const clearCustomerSelection = () => {
    setCustomerFromNav(null);
    setContactIdFromNav(null);
    setSelectedContact(null);
    setSelectedContract(null);
    setSelectedPhoneNumber('');
  };

  const handleCallStart = () => {
    const startTime = Date.now();
    setCallResult({ startTime, status: 'active' });
    console.log('Anruf gestartet');
  };

  const handleCallEnd = (duration: number) => {
    setCallDuration(duration);
    setCallResult(prev => prev ? { ...prev, endTime: Date.now(), status: 'ended' } : null);
    console.log('Anruf beendet');
  };

  const handleSaveCallLog = () => {
    if (!callResult || !callOutcome) {
      console.error('Bitte wählen Sie ein Anrufergebnis aus');
      return;
    }

    console.log('Anrufprotokoll gespeichert');
    
    // Reset form
    setCallNotes('');
    setCallOutcome('');
    setCallResult(null);
    setCallDuration(0);
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConnect = async () => {
    if (!selectedFiliale) {
      setIsFilialSelectionOpen(true);
      return;
    }

    setIsConnecting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConnected(true);
      console.log('Erfolgreich mit Filiale verbunden');
    } catch (error) {
      console.error('Verbindung fehlgeschlagen');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    console.log('Verbindung getrennt');
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
