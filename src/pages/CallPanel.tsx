
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  Phone, 
  PhoneOff, 
  User, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Check, 
  X,
  FileText,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { customerService, callService, appointmentService } from "@/services/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import WebRTCClient from "@/components/sip/WebRTCClient";
import { BranchSelectionDialog } from "@/components/dialogs/BranchSelectionDialog";
import { useLocation, useNavigate } from "react-router-dom";

// Customer type definition
interface CustomerContract {
  id: string;
  type: string;
  status: string;
  expiryDate: string;
}

interface CustomerContact {
  id: string;
  phone: string;
  contactType: string;
  isPrimary: boolean;
}

interface Customer {
  id: string;
  name: string;
  company: string;
  contacts: CustomerContact[];
  contracts: CustomerContract[];
  lastContact: string;
  priority: string;
  notes?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  customerCount: number;
}

const CallPanel = () => {
  const [activeCall, setActiveCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [callLog, setCallLog] = useState("");
  const [callOutcome, setCallOutcome] = useState("");
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("beratung");
  const [isFilialSelectionOpen, setIsFilialSelectionOpen] = useState(false);
  const [selectedFiliale, setSelectedFiliale] = useState<string | null>(null);
  const { toast: useToastHook } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if we need to show filiale selection for admin
  const needsFilialSelection = user && user.role === "admin" && !selectedFiliale;
  
  useEffect(() => {
    if (needsFilialSelection) {
      setIsFilialSelectionOpen(true);
    }
  }, [needsFilialSelection]);
  
  // Handle filiale selection
  const handleFilialeSelected = (filialeId: string) => {
    setSelectedFiliale(filialeId);
    setIsFilialSelectionOpen(false);
  };

  // Check if customer was passed from previous screen
  useEffect(() => {
    if (location.state?.customer) {
      setSelectedCustomer(location.state.customer);
      
      if (location.state.contactId) {
        setSelectedContactId(location.state.contactId);
      }
      
      if (location.state.contractId) {
        setSelectedContractId(location.state.contractId);
      }
    }
  }, [location.state]);

  // Fetch customers data
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers', selectedFiliale, selectedCampaignId],
    queryFn: () => customerService.getCustomers(selectedFiliale, selectedCampaignId),
    enabled: !needsFilialSelection,
  });
  
  // Fetch campaigns
  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['campaigns', selectedFiliale],
    queryFn: () => customerService.getCampaigns(selectedFiliale),
    enabled: !needsFilialSelection,
  });

  // Set first customer as selected when data loads
  useEffect(() => {
    if (customers && customers.length > 0 && !selectedCustomer && !location.state?.customer) {
      setSelectedCustomer(customers[0]);
    }
  }, [customers, selectedCustomer, location.state]);

  // Call log mutation
  const { mutate: logCallMutation, isPending: isLoggingCall } = useMutation({
    mutationFn: callService.logCall,
    onSuccess: (data) => {
      if (callOutcome === "appointment") {
        setShowAppointmentDialog(true);
      } else {
        toast.success("Anruf wurde erfolgreich dokumentiert");
        resetCallState();
      }
    },
  });

  // Create appointment mutation
  const { mutate: createAppointmentMutation, isPending: isCreatingAppointment } = useMutation({
    mutationFn: appointmentService.createAppointment,
    onSuccess: (data) => {
      toast.success(`Termin am ${appointmentDate} um ${appointmentTime} Uhr wurde eingetragen.`);
      
      if (data.sync_status) {
        toast.success("Termin wurde erfolgreich mit KeyEff CRM synchronisiert.");
      } else if (data.sync_message) {
        toast.error(`Synchronisierung fehlgeschlagen: ${data.sync_message}`);
      }
      
      setShowAppointmentDialog(false);
      resetCallState();
    },
  });

  const handleCall = () => {
    if (!activeCall) {
      // Start call
      setActiveCall(true);
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      setIntervalId(timer);
    } else {
      // End call
      setActiveCall(false);
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  };

  const resetCallState = () => {
    setCallLog("");
    setCallOutcome("");
    setCallDuration(0);
    setAppointmentDate("");
    setAppointmentTime("");
    setAppointmentType("beratung");
    setActiveCall(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c: Customer) => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setSelectedContactId(null);
      setSelectedContractId(null);
    }
  };

  const handleSaveCallLog = () => {
    if (!selectedCustomer) return;
    
    if (!callLog.trim() || !callOutcome) {
      useToastHook({
        title: "Fehlende Informationen",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    logCallMutation({
      customer_id: selectedCustomer.id,
      log_text: callLog,
      outcome: callOutcome,
      duration: callDuration,
      contract_id: selectedContractId,
      contact_id: selectedContactId,
      campaign_id: selectedCampaignId
    });
  };

  const handleSaveAppointment = () => {
    if (!selectedCustomer) return;
    
    if (!appointmentDate || !appointmentTime || !appointmentType) {
      useToastHook({
        title: "Fehlende Informationen",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    createAppointmentMutation({
      customer_id: selectedCustomer.id,
      date: appointmentDate,
      time: appointmentTime,
      type: appointmentType,
      description: callLog,
      contract_id: selectedContractId,
      campaign_id: selectedCampaignId
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-amber-100 text-amber-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high": return "Hoch";
      case "medium": return "Mittel";
      case "low": return "Niedrig";
      default: return priority;
    }
  };

  // WebRTC handlers
  const handleWebRTCCallStart = () => {
    setActiveCall(true);
  };

  const handleWebRTCCallEnd = (duration: number) => {
    setActiveCall(false);
    setCallDuration(duration);
  };
  
  const handleGotoCustomers = () => {
    navigate("/customers");
  };

  if (isLoadingCustomers || needsFilialSelection) {
    return (
      <AppLayout 
        title="Anrufpanel" 
        subtitle="Kundenkontakte verwalten"
        showCallButton={false}
      >
        {needsFilialSelection && (
          <BranchSelectionDialog 
            open={isFilialSelectionOpen} 
            onOpenChange={setIsFilialSelectionOpen}
            onBranchSelected={handleFilialeSelected}
          />
        )}
        
        {!needsFilialSelection && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-keyeff-500 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Kundendaten werden geladen...</p>
            </div>
          </div>
        )}
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Anrufpanel" 
      subtitle="Kundenkontakte verwalten"
      showCallButton={false}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Kampagnen</CardTitle>
              <CardDescription>Wählen Sie eine aktive Kampagne</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedCampaignId || ""} onValueChange={(value) => setSelectedCampaignId(value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Kunden anzeigen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Kunden anzeigen</SelectItem>
                  {campaigns && campaigns.map((campaign: any) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name} ({campaign.customerCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Kundenliste</CardTitle>
                <CardDescription>Nach Priorität sortierte Kontakte</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleGotoCustomers}>
                Alle Kunden
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {customers && customers.length > 0 ? (
                customers.map((customer: any) => (
                  <div 
                    key={customer.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${selectedCustomer?.id === customer.id ? 'border-keyeff-500 bg-accent' : ''}`}
                    onClick={() => handleCustomerChange(customer.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium">{customer.name}</h3>
                      <Badge className={getPriorityColor(customer.priority)}>
                        {getPriorityText(customer.priority)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{customer.company}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {customer.primary_phones ? (
                          <Badge variant="outline" className="font-mono">{customer.primary_phones.split(',')[0]}</Badge>
                        ) : 'Keine Telefonnummer'}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Keine Kunden gefunden</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Customer */}
        <div className="lg:col-span-2">
          {selectedCustomer ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedCustomer.name}</CardTitle>
                    <CardDescription>{selectedCustomer.company}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label>Kontaktnummer auswählen</Label>
                    <Select 
                      value={selectedContactId || ""} 
                      onValueChange={(value) => setSelectedContactId(value || null)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Telefonnummer auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCustomer.contacts ? (
                          selectedCustomer.contacts.map(contact => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.phone} ({contact.contactType}{contact.isPrimary ? ", Primär" : ""})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>Keine Kontakte verfügbar</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    
                    <Label>Vertrag auswählen</Label>
                    <Select 
                      value={selectedContractId || ""} 
                      onValueChange={(value) => setSelectedContractId(value || null)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Vertrag auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Kein spezifischer Vertrag</SelectItem>
                        {selectedCustomer.contracts ? (
                          selectedCustomer.contracts.map(contract => (
                            <SelectItem key={contract.id} value={contract.id}>
                              {contract.type} ({contract.status})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>Keine Verträge verfügbar</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Letzter Kontakt: {
                        selectedCustomer.lastContact 
                          ? new Date(selectedCustomer.lastContact).toLocaleDateString('de-DE')
                          : 'Keine Kontakthistorie'
                      }</span>
                    </div>
                  </div>
                  
                  {/* WebRTC SIP Client */}
                  <div className="flex flex-col justify-center">
                    <WebRTCClient
                      onCallStart={handleWebRTCCallStart}
                      onCallEnd={handleWebRTCCallEnd}
                      phoneNumber={selectedContactId 
                        ? selectedCustomer.contacts.find(c => c.id === selectedContactId)?.phone 
                        : selectedCustomer.contacts && selectedCustomer.contacts.length > 0 
                          ? selectedCustomer.contacts[0].phone 
                          : ""
                      }
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-3">Gesprächsnotiz</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="callLog">Gesprächsverlauf</Label>
                      <Textarea 
                        id="callLog" 
                        placeholder="Dokumentieren Sie hier den Gesprächsverlauf..."
                        value={callLog}
                        onChange={(e) => setCallLog(e.target.value)}
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="callOutcome">Ergebnis</Label>
                      <Select
                        value={callOutcome}
                        onValueChange={setCallOutcome}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ergebnis auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interested">Interessiert</SelectItem>
                          <SelectItem value="not_interested">Nicht interessiert</SelectItem>
                          <SelectItem value="callback">Rückruf vereinbart</SelectItem>
                          <SelectItem value="appointment">Termin vereinbart</SelectItem>
                          <SelectItem value="no_answer">Keine Antwort</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t pt-4">
                <Button variant="outline" onClick={resetCallState}>
                  <X className="mr-2" size={16} />
                  Zurücksetzen
                </Button>
                <Button 
                  className="bg-keyeff-500 hover:bg-keyeff-600"
                  onClick={handleSaveCallLog}
                  disabled={isLoggingCall}
                >
                  {isLoggingCall ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Wird gespeichert...
                    </div>
                  ) : (
                    <>
                      <FileText className="mr-2" size={16} />
                      Speichern
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Bitte wählen Sie einen Kunden aus der Liste aus.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Appointment Dialog */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Termin vereinbaren</DialogTitle>
            <DialogDescription>
              {selectedCustomer && `Termindetails für ${selectedCustomer.name} (${selectedCustomer.company})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Datum</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentTime">Uhrzeit</Label>
                <Input
                  id="appointmentTime"
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointmentType">Termintyp</Label>
              <Select
                value={appointmentType}
                onValueChange={setAppointmentType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Termintyp auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beratung">Beratungsgespräch</SelectItem>
                  <SelectItem value="vertragsverlaengerung">Vertragsverlängerung</SelectItem>
                  <SelectItem value="praesentation">Produktpräsentation</SelectItem>
                  <SelectItem value="service">Service-Termin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedCustomer && selectedCustomer.contracts && selectedCustomer.contracts.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="contractSelection">Bezogen auf Vertrag</Label>
                <Select
                  value={selectedContractId || ""}
                  onValueChange={(value) => setSelectedContractId(value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vertrag auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Kein spezifischer Vertrag</SelectItem>
                    {selectedCustomer.contracts.map(contract => (
                      <SelectItem key={contract.id} value={contract.id}>
                        {contract.type} ({contract.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppointmentDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              className="bg-keyeff-500 hover:bg-keyeff-600" 
              onClick={handleSaveAppointment}
              disabled={isCreatingAppointment}
            >
              {isCreatingAppointment ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Wird gespeichert...
                </div>
              ) : (
                <>
                  <Check className="mr-2" size={16} />
                  Termin speichern
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default CallPanel;
