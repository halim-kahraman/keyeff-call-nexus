
import React, { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mock customer data
const customerList = [
  {
    id: "1",
    name: "Albert Schmidt",
    company: "Schmidt Elektro GmbH",
    phone: "+49 30 12345678",
    contract: {
      type: "Premium Service",
      status: "Aktiv",
      expiryDate: "2025-06-15"
    },
    lastContact: "2025-04-01",
    priority: "high"
  },
  {
    id: "2",
    name: "Maria Müller",
    company: "Müller Marketing",
    phone: "+49 30 87654321",
    contract: {
      type: "Basic Service",
      status: "Aktiv",
      expiryDate: "2025-06-01"
    },
    lastContact: "2025-04-10",
    priority: "medium"
  },
  {
    id: "3",
    name: "Thomas Weber",
    company: "Weber & Söhne",
    phone: "+49 30 55443322",
    contract: {
      type: "Premium Plus",
      status: "Inaktiv",
      expiryDate: "2025-03-01"
    },
    lastContact: "2025-03-15",
    priority: "low"
  },
];

const CallPanel = () => {
  const [activeCall, setActiveCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(customerList[0]);
  const [callLog, setCallLog] = useState("");
  const [callOutcome, setCallOutcome] = useState("");
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("beratung");
  const { toast } = useToast();

  const handleCall = () => {
    if (!activeCall) {
      // Start call
      setActiveCall(true);
      let seconds = 0;
      const timer = setInterval(() => {
        seconds++;
        setCallDuration(seconds);
      }, 1000);

      // Store timer ID in component instance
      return () => clearInterval(timer);
    } else {
      // End call
      setActiveCall(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customerList.find(c => c.id === customerId);
    if (customer) setSelectedCustomer(customer);
  };

  const handleSaveCallLog = () => {
    if (!callLog.trim() || !callOutcome) {
      toast({
        title: "Fehlende Informationen",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    if (callOutcome === "appointment") {
      setShowAppointmentDialog(true);
    } else {
      toast({
        title: "Anruf dokumentiert",
        description: "Der Anruf wurde erfolgreich dokumentiert.",
      });
      
      // Reset state
      setCallLog("");
      setCallOutcome("");
      setCallDuration(0);
    }
  };

  const handleSaveAppointment = () => {
    if (!appointmentDate || !appointmentTime || !appointmentType) {
      toast({
        title: "Fehlende Informationen",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Termin vereinbart",
      description: `Termin am ${appointmentDate} um ${appointmentTime} Uhr wurde für ${selectedCustomer.name} eingetragen.`,
    });

    // Reset state
    setShowAppointmentDialog(false);
    setCallLog("");
    setCallOutcome("");
    setCallDuration(0);
    setAppointmentDate("");
    setAppointmentTime("");
    setAppointmentType("beratung");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-amber-100 text-amber-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
              {customerList.map((customer) => (
                <div 
                  key={customer.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${selectedCustomer?.id === customer.id ? 'border-keyeff-500 bg-accent' : ''}`}
                  onClick={() => handleCustomerChange(customer.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium">{customer.name}</h3>
                    <Badge className={getPriorityColor(customer.priority)}>
                      {customer.priority === "high" ? "Hoch" : customer.priority === "medium" ? "Mittel" : "Niedrig"}
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
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Active Customer */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedCustomer.name}</CardTitle>
                  <CardDescription>{selectedCustomer.company}</CardDescription>
                </div>
                <Button 
                  onClick={handleCall}
                  className={activeCall ? "bg-destructive hover:bg-destructive/90" : "bg-keyeff-500 hover:bg-keyeff-600"}
                >
                  {activeCall ? (
                    <>
                      <PhoneOff className="mr-2" size={16} />
                      Anruf beenden ({formatDuration(callDuration)})
                    </>
                  ) : (
                    <>
                      <Phone className="mr-2" size={16} />
                      Anrufen
                    </>
                  )}
                </Button>
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
              <Button variant="outline" onClick={() => {
                setCallLog("");
                setCallOutcome("");
              }}>
                <X className="mr-2" size={16} />
                Zurücksetzen
              </Button>
              <Button 
                className="bg-keyeff-500 hover:bg-keyeff-600"
                onClick={handleSaveCallLog}
              >
                <FileText className="mr-2" size={16} />
                Speichern
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Appointment Dialog */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Termin vereinbaren</DialogTitle>
            <DialogDescription>
              Termindetails für {selectedCustomer.name} ({selectedCustomer.company})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Datum</Label>
                <Input
                  id="appointmentDate"
                  type="date"
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
            <Button className="bg-keyeff-500 hover:bg-keyeff-600" onClick={handleSaveAppointment}>
              <Check className="mr-2" size={16} />
              Termin speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default CallPanel;
