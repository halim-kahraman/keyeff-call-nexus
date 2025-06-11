
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { campaignService, customerService, connectionService } from '@/services/api';
import { toast } from 'sonner';

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
  const [selectedFiliale, setSelectedFiliale] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [customerFromNav, setCustomerFromNav] = useState(null);
  const [contactIdFromNav, setContactIdFromNav] = useState(null);
  const [connections, setConnections] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const { user } = useAuth();

  // Queries
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignService.getCampaigns,
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: customerService.getCustomers,
  });

  const isLoading = campaignsLoading || customersLoading;

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
    toast.success('Anruf gestartet');
  };

  const handleCallEnd = (duration: number) => {
    setCallDuration(duration);
    setCallResult(prev => prev ? { ...prev, endTime: Date.now(), status: 'ended' } : null);
    toast.success('Anruf beendet');
  };

  const handleSaveCallLog = () => {
    if (!callResult || !callOutcome) {
      toast.error('Bitte wählen Sie ein Anrufergebnis aus');
      return;
    }

    // Here you would save the call log to the backend
    toast.success('Anrufprotokoll gespeichert');
    
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
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConnected(true);
      toast.success('Erfolgreich mit Filiale verbunden');
    } catch (error) {
      toast.error('Verbindung fehlgeschlagen');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast.info('Verbindung getrennt');
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
