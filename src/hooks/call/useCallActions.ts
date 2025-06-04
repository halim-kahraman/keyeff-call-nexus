
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface UseCallActionsProps {
  filialeId: number | null;
  selectedPhoneNumber: string;
  selectedContact: any;
  callDuration: number;
  callResult: any;
  customerFromNav: any;
  selectedCampaign: string | null;
  callOutcome: string;
  callNotes: string;
  setCallDuration: (duration: number) => void;
  setCallResult: (result: any) => void;
  setCallNotes: (notes: string) => void;
  setCallOutcome: (outcome: string) => void;
  setSelectedPhoneNumber: (number: string) => void;
  setSelectedContact: (contact: any) => void;
  setSelectedContract: (contract: any) => void;
  setCustomerFromNav: (customer: any) => void;
  setContactIdFromNav: (id: string | null) => void;
  setFilialeId: (id: number | null) => void;
  isConnected: boolean;
}

export const useCallActions = (props: UseCallActionsProps) => {
  console.log('DEBUG: useCallActions starting...');
  
  const {
    filialeId,
    selectedPhoneNumber,
    selectedContact,
    callDuration,
    callResult,
    customerFromNav,
    selectedCampaign,
    callOutcome,
    callNotes,
    setCallDuration,
    setCallResult,
    setCallNotes,
    setCallOutcome,
    setSelectedPhoneNumber,
    setSelectedContact,
    setSelectedContract,
    setCustomerFromNav,
    setContactIdFromNav,
    setFilialeId,
    isConnected
  } = props;

  console.log('DEBUG: useCallActions - props destructured');

  const navigate = useNavigate();

  const handleCallStart = () => {
    console.log('DEBUG: handleCallStart called');
    if (filialeId && isConnected) {
      console.log('Starting call...', { selectedPhoneNumber, selectedContact });
      setCallDuration(0);
      setCallResult(null);
      
      // Start call timer with proper implementation
      let currentDuration = 0;
      const timer = setInterval(() => {
        currentDuration += 1;
        setCallDuration(currentDuration);
      }, 1000);
      
      setCallResult({ timer, started: true });
    } else {
      toast.error('Anruf konnte nicht gestartet werden', {
        description: 'Bitte stellen Sie sicher, dass Sie mit einer Filiale verbunden sind.'
      });
    }
  };

  const handleCallEnd = (duration?: number) => {
    console.log('DEBUG: handleCallEnd called');
    if (callResult?.timer) {
      clearInterval(callResult.timer);
    }
    if (duration !== undefined) {
      setCallDuration(duration);
    }
    setCallResult({ ended: true, duration: duration || callDuration });
  };

  const handleFilialeSelected = (branchId: string) => {
    console.log('DEBUG: handleFilialeSelected called');
    setFilialeId(parseInt(branchId));
    navigate(`/call/${branchId}`);
  };

  const clearCustomerSelection = () => {
    console.log('DEBUG: clearCustomerSelection called');
    setCustomerFromNav(null);
    setContactIdFromNav(null);
    setSelectedContact(null);
    setSelectedContract(null);
    setSelectedPhoneNumber("");
  };

  const handleSaveCallLog = async () => {
    console.log('DEBUG: handleSaveCallLog called');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/calls/log.php', {
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
          log_text: callNotes,
          campaign_id: selectedCampaign
        })
      });
      
      if (response.ok) {
        toast.success('Anruf-Log gespeichert');
        
        // Reset form
        setCallNotes("");
        setCallOutcome("");
        setCallDuration(0);
        setCallResult(null);
      } else {
        throw new Error('Server error');
      }
      
    } catch (error) {
      console.error('DEBUG: Error in handleSaveCallLog:', error);
      toast.error('Fehler beim Speichern des Anruf-Logs');
    }
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  console.log('DEBUG: useCallActions - preparing return object');

  return {
    handleCallStart,
    handleCallEnd,
    handleFilialeSelected,
    clearCustomerSelection,
    handleSaveCallLog,
    formatCallDuration
  };
};
