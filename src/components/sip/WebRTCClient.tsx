
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, User, Calendar, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export interface CustomerContract {
  id: string;
  contract_number: string;
  contract_type: string;
  contract_status: string;
  contract_start?: string;
  contract_expiry?: string;
  monthly_value?: number;
}

export interface CustomerContact {
  id: string;
  phone: string;
  contact_type: string;
  contact_name?: string;
  is_primary: boolean;
}

export interface CallCustomer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  priority: string;
  contracts?: CustomerContract[];
  contacts?: CustomerContact[];
  last_contact?: string;
  notes?: string;
}

export interface WebRTCClientProps {
  onCallStart?: () => void;
  onCallEnd?: (duration: number) => void;
  phoneNumber?: string;
  customer?: CallCustomer;
  contactId?: string;
  campaignScript?: string;
}

export const WebRTCClient: React.FC<WebRTCClientProps> = ({ 
  onCallStart, 
  onCallEnd,
  phoneNumber = "",
  customer,
  contactId,
  campaignScript
}) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [selectedContact, setSelectedContact] = useState<CustomerContact | undefined>(
    customer?.contacts?.find(c => c.id === contactId) || 
    customer?.contacts?.find(c => c.is_primary) ||
    customer?.contacts?.[0]
  );

  // Find active contract
  const activeContract = customer?.contracts?.find(c => c.contract_status === "Aktiv") || customer?.contracts?.[0];
  
  // Check for contracts ending soon (within 30 days)
  const today = new Date();
  const contractsEndingSoon = customer?.contracts?.filter(contract => {
    if (!contract.contract_expiry) return false;
    const expiryDate = new Date(contract.contract_expiry);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  });

  // Cleanup timer when component unmounts
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  // Update the contact when contactId prop changes
  useEffect(() => {
    if (contactId && customer?.contacts) {
      setSelectedContact(customer.contacts.find(c => c.id === contactId) || customer.contacts[0]);
    }
  }, [contactId, customer]);

  const startCall = () => {
    // In a real app, this would initiate the SIP call
    setIsCallActive(true);
    
    // Start timer for call duration
    const intervalId = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    setTimer(intervalId);
    
    if (onCallStart) onCallStart();
    
    // For demo purposes, log the phone number if provided
    if (phoneNumber) {
      console.log(`Starting call to ${phoneNumber}`);
    }
  };

  const endCall = () => {
    // In a real app, this would terminate the SIP call
    setIsCallActive(false);
    
    // Stop timer
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    // Report duration back if callback provided
    if (onCallEnd) onCallEnd(callDuration);
    
    // Reset duration
    setCallDuration(0);
  };

  const toggleMute = () => {
    // In a real app, this would mute/unmute the SIP call
    setIsMuted(!isMuted);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd.MM.yyyy", { locale: de });
  };

  // Get badge color for priority
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return "bg-red-100 text-red-800";
      case 'medium':
        return "bg-amber-100 text-amber-800";
      case 'low':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get text for priority
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return "Hoch";
      case 'medium':
        return "Mittel";
      case 'low':
        return "Niedrig";
      default:
        return priority;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Call control panel */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Telefonanruf</CardTitle>
          <CardDescription>
            {isCallActive 
              ? "Anruf läuft..." 
              : "Starten Sie den Anruf mit dem Kunden"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            {isCallActive ? (
              <div className="mb-4">
                <div className="text-lg font-semibold">
                  {selectedContact?.phone && <div className="mb-1">{selectedContact.phone}</div>}
                  Anruf aktiv
                </div>
                <div className="text-xl font-mono">{formatTime(callDuration)}</div>
              </div>
            ) : (
              <div className="mb-4">
                <div className="text-lg">
                  {selectedContact ? (
                    <div className="font-semibold">{selectedContact.phone}</div>
                  ) : phoneNumber ? (
                    <div className="font-semibold">{phoneNumber}</div>
                  ) : (
                    <div className="text-muted-foreground">Keine Telefonnummer ausgewählt</div>
                  )}
                </div>
                {selectedContact && selectedContact.contact_type && (
                  <div className="text-sm text-muted-foreground">{selectedContact.contact_type}</div>
                )}
              </div>
            )}

            <div className="flex justify-center gap-2">
              {!isCallActive ? (
                <Button 
                  onClick={startCall} 
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={!selectedContact && !phoneNumber}
                >
                  <Phone className="mr-2 h-4 w-4" /> Anruf starten
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={toggleMute} 
                    variant="outline"
                  >
                    {isMuted ? (
                      <><MicOff className="mr-2 h-4 w-4" /> Mikro an</>
                    ) : (
                      <><Mic className="mr-2 h-4 w-4" /> Mikro aus</>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={endCall}
                    variant="destructive"
                  >
                    <PhoneOff className="mr-2 h-4 w-4" /> Anruf beenden
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {customer?.contacts && customer.contacts.length > 1 && (
            <div className="mt-4">
              <h4 className="mb-2 font-medium text-sm">Alternative Telefonnummern:</h4>
              <div className="space-y-1">
                {customer.contacts.map(contact => (
                  <div 
                    key={contact.id}
                    className={`flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-muted ${selectedContact?.id === contact.id ? 'bg-muted' : ''}`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div>
                      <div className="font-medium">{contact.phone}</div>
                      <div className="text-xs text-muted-foreground">
                        {contact.contact_type}
                        {contact.contact_name && ` - ${contact.contact_name}`}
                      </div>
                    </div>
                    {contact.is_primary && <Badge variant="outline">Hauptnummer</Badge>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Customer information */}
      <Card className="md:col-span-3">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{customer?.name || "Kunde"}</CardTitle>
              <CardDescription>
                {customer?.company || ""}
                {customer?.last_contact && ` - Letzter Kontakt: ${formatDate(customer.last_contact)}`}
              </CardDescription>
            </div>
            {customer?.priority && (
              <Badge className={getPriorityBadge(customer.priority)}>
                {getPriorityText(customer.priority)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {customer ? (
            <div className="space-y-6">
              {/* Contract Information */}
              {activeContract && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Calendar className="mr-2 h-4 w-4" /> Aktiver Vertrag
                  </h3>
                  <div className="bg-muted/50 rounded-md p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Vertragsnummer</span>
                        <p className="font-medium">{activeContract.contract_number || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Vertragstyp</span>
                        <p className="font-medium">{activeContract.contract_type}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Startdatum</span>
                        <p className="font-medium">{formatDate(activeContract.contract_start)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Enddatum</span>
                        <p className="font-medium">{formatDate(activeContract.contract_expiry)}</p>
                      </div>
                      {activeContract.monthly_value && (
                        <div>
                          <span className="text-xs text-muted-foreground">Monatlicher Wert</span>
                          <p className="font-medium">{activeContract.monthly_value.toFixed(2)} €</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Contract warnings */}
              {contractsEndingSoon && contractsEndingSoon.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <h3 className="text-sm font-medium mb-2 flex items-center text-amber-800">
                    <AlertCircle className="mr-2 h-4 w-4" /> Verträge laufen bald aus
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {contractsEndingSoon.map(contract => (
                      <li key={contract.id} className="flex justify-between">
                        <span>{contract.contract_type} ({contract.contract_number})</span>
                        <span className="font-medium">{formatDate(contract.contract_expiry)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Customer notes */}
              {customer.notes && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Notizen:</h3>
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Keine Kundeninformationen verfügbar
            </div>
          )}

          {/* Campaign script */}
          {campaignScript && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <User className="mr-2 h-4 w-4" /> Gesprächsleitfaden
              </h3>
              <div className="bg-muted/50 rounded-md p-3">
                <p className="text-sm whitespace-pre-wrap">{campaignScript}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
