
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, ClipboardList } from "lucide-react";

interface CallControlPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPhoneNumber: string;
  setSelectedPhoneNumber: (number: string) => void;
  selectedContact: any;
  setSelectedContact: (contact: any) => void;
  selectedContract: any;
  setSelectedContract: (contract: any) => void;
  selectedCampaign: string | null;
  setSelectedCampaign: (campaign: string | null) => void;
  customerFromNav: any;
  customers: any[];
  campaigns: any[];
  selectedFiliale: string | null;
  isConnected: boolean;
  clearCustomerSelection: () => void;
}

export const CallControlPanel = ({
  activeTab,
  setActiveTab,
  selectedPhoneNumber,
  setSelectedPhoneNumber,
  selectedContact,
  setSelectedContact,
  selectedContract,
  setSelectedContract,
  selectedCampaign,
  setSelectedCampaign,
  customerFromNav,
  customers,
  campaigns,
  selectedFiliale,
  isConnected,
  clearCustomerSelection
}: CallControlPanelProps) => {
  return (
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
            <TabsTrigger value="customer" disabled={!Array.isArray(customers) || (customers.length === 0 && !customerFromNav)}>
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
              
              {selectedFiliale && Array.isArray(campaigns) && campaigns.length > 0 && (
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
                    {Array.isArray(customerFromNav.contacts) ? (
                      customerFromNav.contacts.map((contact: any) => (
                        <div 
                          key={contact.id}
                          className={`border rounded-lg p-3 cursor-pointer ${selectedContact?.id === contact.id ? 'border-primary ring-2 ring-primary ring-opacity-50' : ''}`}
                          onClick={() => {
                            setSelectedContact(contact);
                            setSelectedPhoneNumber(contact.phone || "");
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
                      )) || []
                    )}
                  </div>
                </div>
                
                {Array.isArray(customerFromNav.contracts) && customerFromNav.contracts.length > 0 && (
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
  );
};
