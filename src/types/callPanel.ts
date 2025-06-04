
export interface CallPanelState {
  activeTab: string;
  selectedPhoneNumber: string;
  selectedContact: any;
  selectedContract: any;
  callResult: any;
  callNotes: string;
  callOutcome: string;
  callDuration: number;
  isFilialSelectionOpen: boolean;
  selectedFiliale: string | null;
  selectedCampaign: string | null;
  customerFromNav: any;
  contactIdFromNav: string | null;
  isLoading: boolean;
  campaigns: any[];
  customers: any[];
  filialeId: number | null;
  isCallActive: boolean;
  isPanelReady: boolean;
}

export interface CallPanelActions {
  setActiveTab: (tab: string) => void;
  setSelectedPhoneNumber: (number: string) => void;
  setSelectedContact: (contact: any) => void;
  setSelectedContract: (contract: any) => void;
  setCallNotes: (notes: string) => void;
  setCallOutcome: (outcome: string) => void;
  setIsFilialSelectionOpen: (open: boolean) => void;
  setSelectedCampaign: (campaign: string | null) => void;
  setSelectedFiliale: (filiale: string | null) => void;
  setFilialeId: (id: number) => void;
  setIsPanelReady: (ready: boolean) => void;
  setCustomerFromNav: (customer: any) => void;
  setContactIdFromNav: (id: string | null) => void;
  handleFilialeSelected: (branchId: string) => void;
  clearCustomerSelection: () => void;
  handleCallStart: () => void;
  handleCallEnd: (duration?: number) => void;
  handleSaveCallLog: () => Promise<void>;
  formatCallDuration: (seconds: number) => string;
  handleConnect: () => Promise<void>;
  handleDisconnect: () => Promise<void>;
  fetchConnections: () => Promise<void>;
}

export interface CallPanelManagerReturn extends CallPanelState, CallPanelActions {
  connections: any[];
  isConnecting: boolean;
  isConnected: boolean;
}
