
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WebRTCClient } from "@/components/sip/WebRTCClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BranchSelectionDialog } from "@/components/dialogs/BranchSelectionDialog";
import { useQuery } from "@tanstack/react-query";
import { customerService, campaignService } from "@/services/api";
import { Phone, CalendarClock, ClipboardList, Clock, CheckCircle, XCircle, PhoneOff, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { useConnectionManager } from "@/hooks/useConnectionManager";

const CallPanel = () => {
  const [activeTab, setActiveTab] = useState("dialpad");
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [callResult, setCallResult] = useState<any>(null);
  const [callNotes, setCallNotes] = useState("");
  const [callOutcome, setCallOutcome] = useState("Erfolgreich");
  const [callDuration, setCallDuration] = useState(0);
  const [isFilialSelectionOpen, setIsFilialSelectionOpen] = useState(false);
  const [selectedFiliale, setSelectedFiliale] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { connections, isConnecting, isConnected, connectToFiliale, disconnectFromFiliale } = useConnectionManager();
  
  // Customer from navigation state if available
  const customerFromNav = location.state?.customer;
  const contactIdFromNav = location.state?.contactId;
  const campaignFromNav = location.state?.campaignId;
  
  // Determine if user needs to select filiale
  const needsFilialSelection = user && user.role === 'admin' && !selectedFiliale;

  // Handle filiale selection and connection
  const handleFilialeSelected = async (filialeId: string) => {
    setSelectedFiliale(filialeId);
    setIsFilialSelectionOpen(false);
    
    // Start connection process
    toast({
      title: "Verbindung wird hergestellt...",
      description: "VPN, SIP und WebRTC werden initialisiert.",
    });
    
    try {
      await connectToFiliale(parseInt(filialeId), `Filiale ${filialeId}`);
      toast({
        title: "Verbindung hergestellt",
        description: `Erfolgreich mit Filiale verbunden.`,
      });
    } catch (error) {
      toast({
        title: "Verbindungsfehler",
        description: "Fehler beim Herstellen der Verbindung zur Filiale.",
        variant: "destructive"
      });
    }
  };

  // Clear customer selection
  const clearCustomerSelection = () => {
    setSelectedContact(null);
    setSelectedContract(null);
    setSelectedPhoneNumber("");
  };

  // Handle call start - only allowed if connected
  const handleCallStart = () => {
    if (!isConnected) {
      toast({
        title: "Keine Verbindung",
        description: "Eine Verbindung zur Filiale muss hergestellt werden, bevor Anrufe getätigt werden können.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPhoneNumber) {
      toast({
        title: "Keine Telefonnummer",
        description: "Bitte geben Sie eine Telefonnummer ein.",
        variant: "destructive"
      });
      return;
    }

    console.log('Call started to:', selectedPhoneNumber);
    setCallResult(null);
    setCallDuration(0);
  };

  // Handle call end
  const handleCallEnd = (duration: number) => {
    console.log('Call ended with duration:', duration);
    setCallResult({
      duration: duration,
      timestamp: new Date().toISOString()
    });
    setCallDuration(duration);
  };

  // Save call log
  const handleSaveCallLog = async () => {
    try {
      const logData = {
        phone_number: selectedPhoneNumber,
        duration: callDuration,
        outcome: callOutcome,
        notes: callNotes,
        customer_id: customerFromNav?.id,
        campaign_id: selectedCampaign,
        filiale_id: selectedFiliale
      };

      // Save to backend
      const response = await fetch('/api/calls/log.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(logData)
      });

      if (response.ok) {
        toast({
          title: "Anruf gespeichert",
          description: "Der Anruf wurde erfolgreich protokolliert.",
        });
        
        // Reset form
        setCallResult(null);
        setCallNotes("");
        setCallDuration(0);
        setCallOutcome("Erfolgreich");
      } else {
        throw new Error('Failed to save call log');
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Der Anruf konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  // Format time for timer display
  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Fetch campaigns for the selected filiale
  const { data: campaigns } = useQuery({
    queryKey: ['campaigns', selectedFiliale],
    queryFn: () => campaignService.getCampaigns(),
    enabled: !!selectedFiliale,
  });

  // Fetch customers based on the selected campaign
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', selectedFiliale, selectedCampaign],
    queryFn: () => customerService.getCustomers(selectedFiliale, selectedCampaign),
    enabled: !!selectedFiliale,
  });

  // Set default customer from navigation if available
  useEffect(() => {
    if (customerFromNav) {
      setActiveTab("customer");
      
      // If specific contact ID was passed, find it
      if (contactIdFromNav && customerFromNav.contacts) {
        const contact = customerFromNav.contacts.find((c: any) => c.id === contactIdFromNav);
        if (contact) {
          setSelectedContact(contact);
          setSelectedPhoneNumber(contact.phone);
        } else {
          // Default to first contact or primary phone
          setSelectedPhoneNumber(customerFromNav.primary_phones?.split(',')[0] || "");
        }
      } else {
        // Default to first phone number
        setSelectedPhoneNumber(customerFromNav.primary_phones?.split(',')[0] || "");
      }
      
      // Default to first contract
      if (customerFromNav.contracts && customerFromNav.contracts.length > 0) {
        setSelectedContract(customerFromNav.contracts[0]);
      }
    }
  }, [customerFromNav, contactIdFromNav]);
  
  // Set up filial selection if needed
  useEffect(() => {
    if (needsFilialSelection) {
      setIsFilialSelectionOpen(true);
    }
  }, [needsFilialSelection]);
  
  // Set campaign from navigation
  useEffect(() => {
    if (campaignFromNav) {
      setSelectedCampaign(campaignFromNav.toString());
    }
  }, [campaignFromNav]);

  if (isLoading) {
    return (
      <AppLayout title="Anrufe" subtitle="Telefonzentrale">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Anrufe" subtitle="Telefonzentrale">
      {/* Connection Status Bar */}
      <div className="mb-6">
        <Card className={`border-2 ${isConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <Wifi className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="flex items-center gap-2">
                    <WifiOff className="h-5 w-5 text-red-600" />
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {isConnected ? 'Verbunden mit Filiale' : 'KEINE VERBINDUNG - Anrufe nicht möglich'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isConnected ? 'VPN, SIP und WebRTC aktiv' : 'Verbindung zur Filiale muss hergestellt werden'}
                  </p>
                </div>
              </div>
              {selectedFiliale && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => isConnected ? disconnectFromFiliale() : connectToFiliale(parseInt(selectedFiliale), `Filiale ${selectedFiliale}`)}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Verbinde...' : isConnected ? 'Trennen' : 'Verbinden'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning if not connected */}
      {!isConnected && (
        <div className="mb-6">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Warnung: Keine Verbindung zur Filiale</p>
                  <p className="text-sm text-amber-700">
                    Um Anrufe tätigen zu können, muss eine vollständige Verbindung (VPN, SIP, WebRTC) zur Filiale hergestellt werden.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Call Controls and Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Anrufsteuerung</span>
                {customerFromNav && (
                  <Badge variant="outline" className="text-md font-normal">
                    Kunde: {customerFromNav.name}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dialpad">
                    <Phone className="h-4 w-4 mr-2" />
                    Wählen
                  </TabsTrigger>
                  <TabsTrigger value="customer" disabled={!customers?.length && !customerFromNav}>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Kundenliste
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="dialpad" className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="number">Telefonnummer</Label>
                      <div className="flex mt-1">
                        <input
                          type="tel"
                          id="number"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="+49 123 456789"
                          value={selectedPhoneNumber}
                          onChange={(e) => setSelectedPhoneNumber(e.target.value)}
                          disabled={!isConnected}
                        />
                      </div>
                      {!isConnected && (
                        <p className="text-xs text-red-600 mt-1">
                          Eingabe deaktiviert - keine Verbindung zur Filiale
                        </p>
                      )}
                    </div>
                    
                    {selectedFiliale && campaigns && campaigns.length > 0 && (
                      <div>
                        <Label htmlFor="campaign">Kampagne auswählen</Label>
                        <Select value={selectedCampaign || ""} onValueChange={setSelectedCampaign}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Alle Kunden anzeigen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Alle Kunden anzeigen</SelectItem>
                            {campaigns.map((campaign: any) => (
                              <SelectItem key={campaign.id} value={campaign.id.toString()}>
                                {campaign.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="customer" className="pt-4">
                  {customerFromNav ? (
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <Label>Kunde</Label>
                        <span className="text-lg font-medium">{customerFromNav.name}</span>
                        {customerFromNav.company && (
                          <span className="text-sm text-muted-foreground">{customerFromNav.company}</span>
                        )}
                      </div>
                      
                      <div>
                        <Label className="mb-2 block">Kontakt auswählen</Label>
                        <div className="space-y-2">
                          {customerFromNav.contacts ? (
                            customerFromNav.contacts.map((contact: any) => (
                              <div 
                                key={contact.id}
                                className={`border rounded-lg p-3 cursor-pointer ${selectedContact?.id === contact.id ? 'border-primary ring-2 ring-primary ring-opacity-50' : ''}`}
                                onClick={() => {
                                  setSelectedContact(contact);
                                  setSelectedPhoneNumber(contact.phone);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">{contact.phone}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {contact.contact_type} {contact.contact_name && `- ${contact.contact_name}`}
                                    </div>
                                  </div>
                                  {contact.is_primary === "1" && (
                                    <Badge>Primär</Badge>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            customerFromNav.primary_phones?.split(',').map((phone: string, index: number) => (
                              <div 
                                key={index}
                                className={`border rounded-lg p-3 cursor-pointer ${selectedPhoneNumber === phone ? 'border-primary ring-2 ring-primary ring-opacity-50' : ''}`}
                                onClick={() => setSelectedPhoneNumber(phone)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">{phone}</div>
                                  {index === 0 && <Badge>Primär</Badge>}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      
                      {customerFromNav.contracts && customerFromNav.contracts.length > 0 && (
                        <div>
                          <Label className="mb-2 block">Vertrag auswählen</Label>
                          <div className="space-y-2">
                            {customerFromNav.contracts.map((contract: any) => (
                              <div 
                                key={contract.id}
                                className={`border rounded-lg p-3 cursor-pointer ${selectedContract?.id === contract.id ? 'border-primary ring-2 ring-primary ring-opacity-50' : ''}`}
                                onClick={() => setSelectedContract(contract)}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="font-medium">{contract.contract_type}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {contract.contract_number || 'Keine Vertragsnummer'}
                                    </div>
                                  </div>
                                  <Badge className={
                                    contract.contract_status === 'Aktiv' ? 'bg-green-100 text-green-800' :
                                    contract.contract_status === 'Gekündigt' ? 'bg-red-100 text-red-800' :
                                    'bg-amber-100 text-amber-800'
                                  }>
                                    {contract.contract_status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <Button variant="outline" onClick={clearCustomerSelection}>
                        Zurücksetzen
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">Bitte wählen Sie zunächst eine Kampagne aus.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Anrufergebnis</CardTitle>
            </CardHeader>
            <CardContent>
              {callResult ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div className="flex items-center">
                      <Clock className="text-muted-foreground mr-2 h-5 w-5" />
                      <span>Dauer: <span className="font-mono font-medium">{formatCallDuration(callDuration)}</span></span>
                    </div>
                    <div>
                      <Badge variant="outline">
                        <PhoneOff className="mr-1 h-3 w-3" /> Beendet
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="outcome" className="mb-2 block">Anrufergebnis</Label>
                    <Select value={callOutcome} onValueChange={setCallOutcome}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Erfolgreich">
                          <div className="flex items-center">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Erfolgreich
                          </div>
                        </SelectItem>
                        <SelectItem value="Nicht erreicht">
                          <div className="flex items-center">
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                            Nicht erreicht
                          </div>
                        </SelectItem>
                        <SelectItem value="Rückruf vereinbart">
                          <div className="flex items-center">
                            <CalendarClock className="mr-2 h-4 w-4 text-blue-500" />
                            Rückruf vereinbart
                          </div>
                        </SelectItem>
                        <SelectItem value="Information">
                          <div className="flex items-center">
                            <ClipboardList className="mr-2 h-4 w-4 text-amber-500" />
                            Information
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes" className="mb-2 block">Notizen</Label>
                    <Textarea 
                      id="notes"
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      placeholder="Geben Sie hier Ihre Notizen zum Anruf ein..."
                      rows={4}
                    />
                  </div>
                  
                  <Button onClick={handleSaveCallLog} className="w-full bg-keyeff-500 hover:bg-keyeff-600">
                    Anruf speichern
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <PhoneOff className="mx-auto h-12 w-12 mb-2 opacity-30" />
                  <p>Kein aktiver Anruf</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Phone Interface and Customer Info */}
        <div className="space-y-6">
          <Card className={`border-2 ${isConnected ? 'border-primary/20' : 'border-red-200'}`}>
            <CardHeader className={isConnected ? "bg-primary/5" : "bg-red-50"}>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Telefonie-Interface
                {!isConnected && (
                  <Badge variant="destructive" className="ml-2">Offline</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {!isConnected && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Anrufe nicht verfügbar</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Stellen Sie eine Verbindung zur Filiale her, um Anrufe tätigen zu können.
                  </p>
                </div>
              )}
              
              <WebRTCClient 
                onCallStart={handleCallStart}
                onCallEnd={handleCallEnd}
                phoneNumber={selectedPhoneNumber}
                customer={customerFromNav}
                contactId={contactIdFromNav}
                campaignScript={selectedCampaign ? "Kampagnen-Skript wird geladen..." : undefined}
              />
            </CardContent>
          </Card>

          {/* Campaign Script */}
          {selectedCampaign && (
            <Card>
              <CardHeader>
                <CardTitle>Kampagnen-Skript</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-md p-4">
                  <p className="text-sm whitespace-pre-wrap">
                    Guten Tag, mein Name ist [Name] von KeyEff.
                    
                    Ich rufe Sie bezüglich Ihres Vertrags an.
                    
                    Haben Sie einen Moment Zeit für ein kurzes Gespräch?
                    
                    --- Gesprächsführung ---
                    1. Aktuelle Situation erfragen
                    2. Bedürfnisse ermitteln
                    3. Lösung anbieten
                    4. Termin vereinbaren
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <BranchSelectionDialog
        open={isFilialSelectionOpen}
        onOpenChange={setIsFilialSelectionOpen}
        onBranchSelected={handleFilialeSelected}
      />
    </AppLayout>
  );
};

export default CallPanel;
