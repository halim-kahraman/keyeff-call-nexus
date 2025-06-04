
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
  setFilialeId: (id: number) => void;
  isConnected: boolean;
}

export const useCallActions = ({
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
}: UseCallActionsProps) => {
  const navigate = useNavigate();

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
    handleCallStart,
    handleCallEnd,
    handleFilialeSelected,
    clearCustomerSelection,
    handleSaveCallLog,
    formatCallDuration
  };
};
