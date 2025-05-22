
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

// Customer type definition
interface CustomerContract {
  type: string;
  status: string;
  expiryDate: string;
}

interface Customer {
  id: string;
  name: string;
  company: string;
  phone: string;
  contract: CustomerContract;
  lastContact: string;
  priority: string;
  notes?: string;
}

const CallPanel = () => {
  const [activeCall, setActiveCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [callLog, setCallLog] = useState("");
  const [callOutcome, setCallOutcome] = useState("");
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("beratung");
  const { toast: useToastHook } = useToast();
  const { user } = useAuth();

  // Fetch customers data
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: customerService.getCustomers,
  });

  // Set first customer as selected when data loads
  useEffect(() => {
    if (customers && customers.length > 0 && !selectedCustomer) {
      setSelectedCustomer(customers[0]);
    }
  }, [customers, selectedCustomer]);

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
    if (customer) setSelectedCustomer(customer);
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
      duration: callDuration
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
      description: callLog
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

  if (isLoadingCustomers) {
    return (
      <AppLayout 
        title="Anrufpanel" 
        subtitle="Kundenkontakte verwalten"
        showCallButton={false}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-keyeff-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Kundendaten werden geladen...</p>
          </div>
        </div>
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
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Kundenliste</CardTitle>
              <CardDescription>Nach Priorität sortierte Kontakte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {customers && customers.length > 0 ? (
                customers.map((customer: Customer) => (
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
                        Vertrag: {new Date(customer.contract.expiryDate).toLocaleDateString('de-DE')}
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
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Letzter Kontakt: {new Date(selectedCustomer.lastContact).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Vertrag: {selectedCustomer.contract.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Läuft ab: {new Date(selectedCustomer.contract.expiryDate).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                </div>

                {/* WebRTC SIP Client */}
                <WebRTCClient
                  onCallStart={handleWebRTCCallStart}
                  onCallEnd={handleWebRTCCallEnd}
                />

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
