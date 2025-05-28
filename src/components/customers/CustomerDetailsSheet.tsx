
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Phone, Calendar, FilePlus, File } from "lucide-react";
import { Customer } from "@/types/customer";
import { getStatusBadge, getPriorityBadge, getPriorityText } from "@/utils/customerUtils";

interface CustomerDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onCall: (customer: Customer, contactId?: any) => void;
  onSchedule: (customer: Customer, contractId?: any) => void;
}

export const CustomerDetailsSheet = ({ 
  open, 
  onOpenChange, 
  customer, 
  onCall, 
  onSchedule 
}: CustomerDetailsSheetProps) => {
  if (!customer) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{customer.name}</SheetTitle>
          <SheetDescription>
            Kundennummer: #{customer.id} | Letzter Kontakt: {customer.last_contact ? new Date(customer.last_contact).toLocaleDateString('de-DE') : 'Nie'}
          </SheetDescription>
          <div className="flex space-x-2 mt-2">
            <Button className="flex-1 bg-keyeff-500 hover:bg-keyeff-600" onClick={() => onCall(customer)}>
              <Phone className="mr-2 h-4 w-4" />
              Anrufen
            </Button>
            <Button className="flex-1" variant="outline" onClick={() => onSchedule(customer)}>
              <Calendar className="mr-2 h-4 w-4" />
              Termin
            </Button>
          </div>
        </SheetHeader>
        
        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="contacts" className="flex-1">Kontakt</TabsTrigger>
            <TabsTrigger value="contracts" className="flex-1">Verträge</TabsTrigger>
            <TabsTrigger value="calls" className="flex-1">Anrufe</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Firma</Label>
                <p className="text-sm">{customer.company || "-"}</p>
              </div>
              <div>
                <Label>E-Mail</Label>
                <p className="text-sm">{customer.email || "-"}</p>
              </div>
              <div className="md:col-span-2">
                <Label>Adresse</Label>
                <p className="text-sm">
                  {customer.address ? (
                    <>
                      {customer.address}<br />
                      {customer.postal_code} {customer.city}
                    </>
                  ) : "-"}
                </p>
              </div>
              <div>
                <Label>Priorität</Label>
                <p className="text-sm">
                  <Badge className={getPriorityBadge(customer.priority)}>
                    {getPriorityText(customer.priority)}
                  </Badge>
                </p>
              </div>
              <div>
                <Label>Letzter Kontakt</Label>
                <p className="text-sm">{customer.last_contact ? new Date(customer.last_contact).toLocaleDateString('de-DE') : 'Nie'}</p>
              </div>
              <div className="md:col-span-2">
                <Label>Notizen</Label>
                <p className="text-sm bg-muted p-2 rounded-md mt-1">{customer.notes || "Keine Notizen vorhanden"}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="contacts" className="mt-4">
            <div className="space-y-4">
              {customer.contacts && customer.contacts.length > 0 ? (
                customer.contacts.map((contact: any) => (
                  <div key={contact.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <div className="font-medium flex items-center">
                          {contact.is_primary === "1" && (
                            <Badge className="mr-2 bg-keyeff-100 text-keyeff-800">Primär</Badge>
                          )}
                          {contact.phone}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {contact.contact_type} {contact.contact_name ? `- ${contact.contact_name}` : ''}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        onCall(customer, contact.id);
                      }}>
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                    {contact.notes && (
                      <div className="mt-2 text-sm bg-muted p-2 rounded-md">
                        {contact.notes}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Keine Kontaktdaten vorhanden.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="calls" className="mt-4">
            <div className="space-y-4">
              {customer.call_logs && customer.call_logs.length > 0 ? (
                customer.call_logs.map((call: any) => (
                  <div key={call.id} className="border rounded-md p-3">
                    <div className="flex justify-between">
                      <div className="font-medium">
                        {new Date(call.created_at).toLocaleDateString('de-DE')} - {new Date(call.created_at).toLocaleTimeString('de-DE')}
                      </div>
                      <div>Dauer: {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')} Min.</div>
                    </div>
                    <div className="mt-1 text-sm">
                      <span className="text-muted-foreground">Bearbeiter:</span> {call.user_name}
                    </div>
                    {call.contract_type && (
                      <div className="mt-1 text-sm">
                        <span className="text-muted-foreground">Vertrag:</span> {call.contract_type} {call.contract_number ? `(${call.contract_number})` : ''}
                      </div>
                    )}
                    <div className="mt-1">
                      <Badge>{call.outcome}</Badge>
                    </div>
                    {call.log_text && (
                      <div className="mt-2 text-sm bg-muted p-2 rounded-md">
                        {call.log_text}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Keine Anrufhistorie vorhanden.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="contracts" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Verträge</h3>
              <Button variant="outline" size="sm">
                <FilePlus className="h-4 w-4 mr-2" />
                Vertrag hinzufügen
              </Button>
            </div>
            
            {customer.contracts && customer.contracts.length > 0 ? (
              <div className="space-y-4">
                {customer.contracts.map((contract: any) => (
                  <div key={contract.id} className="border rounded-md p-4">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">{contract.contract_type}</h4>
                        <p className="text-sm text-muted-foreground">
                          Vertragsnummer: {contract.contract_number || 'Keine'}
                        </p>
                      </div>
                      <Badge className={getStatusBadge(contract.contract_status)}>
                        {contract.contract_status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Start:</span> {contract.contract_start ? new Date(contract.contract_start).toLocaleDateString('de-DE') : 'Unbekannt'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ende:</span> {contract.contract_expiry ? new Date(contract.contract_expiry).toLocaleDateString('de-DE') : 'Unbekannt'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Monatlich:</span> {contract.monthly_value ? `${contract.monthly_value} €` : '-'}
                      </div>
                      <div>
                        <Button variant="outline" size="sm" onClick={() => onSchedule(customer, contract.id)}>
                          <Calendar className="h-3 w-3 mr-1" />
                          Termin
                        </Button>
                      </div>
                    </div>
                    
                    {contract.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm">{contract.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-md">
                <File className="mx-auto h-8 w-8 opacity-50 mb-2" />
                <p>Keine Verträge vorhanden</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
