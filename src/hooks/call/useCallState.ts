
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const useCallState = () => {
  const { id: callId } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  
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

  return {
    // State values
    filialeId,
    isCallActive,
    isPanelReady,
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
    isLoading,
    campaigns,
    customers,
    
    // Setters
    setFilialeId,
    setIsPanelReady,
    setActiveTab,
    setSelectedPhoneNumber,
    setSelectedContact,
    setSelectedContract,
    setCallResult,
    setCallNotes,
    setCallOutcome,
    setCallDuration,
    setIsFilialSelectionOpen,
    setSelectedFiliale,
    setSelectedCampaign,
    setCustomerFromNav,
    setContactIdFromNav,
    setIsLoading,
    setCampaigns,
    setCustomers
  };
};
